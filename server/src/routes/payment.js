const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const requireAuth = require('../middleware/auth');
const Course = require('../models/Course');
const User = require('../models/User');
const Purchase = require('../models/Purchase'); // If it exists, or just use User.purchasedCourses

// Initialize Razorpay
const rzpKeyId = (process.env.RAZORPAY_KEY_ID || '').trim();
const rzpKeySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

console.log(`[Razorpay] Key ID loaded: ${rzpKeyId ? rzpKeyId.substring(0, 12) + '...' : '(MISSING)'}`);

const razorpay = new Razorpay({
    key_id: rzpKeyId,
    key_secret: rzpKeySecret
});

// POST /api/payment/create-order
router.post('/create-order', requireAuth, async (req, res) => {
    try {
        const { courseId } = req.body;
        if (!courseId) return res.status(400).json({ message: 'courseId is required' });

        if (!rzpKeyId || !rzpKeySecret) {
            return res.status(500).json({ message: 'Razorpay keys not configured on server' });
        }

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const price = course.priceNumber || 0;
        if (price === 0) {
            return res.json({ free: true, orderId: null, price: 0 });
        }

        // Receipt must be <= 40 chars. Use short IDs.
        const shortUserId = String(req.userId).slice(-8);
        const shortCourseId = String(courseId).slice(-8);
        const receipt = `rct_${shortUserId}_${shortCourseId}_${Date.now()}`;

        const options = {
            amount: price * 100, // paise
            currency: 'INR',
            receipt: receipt.substring(0, 40) // hard cap at 40
        };

        const order = await razorpay.orders.create(options);

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: rzpKeyId
        });
    } catch (error) {
        console.error('Error creating razorpay order:', error);
        res.status(500).json({ message: 'Failed to create payment order' });
    }
});

// POST /api/payment/verify
router.post('/verify', requireAuth, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', rzpKeySecret)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Invalid signature' });
        }

        const user = await User.findById(req.userId);
        const course = await Course.findById(courseId);

        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Add to user's purchasedCourses
        const isAlreadyPurchased = user.purchasedCourses.some(pc =>
            String(pc.courseId) === String(courseId) && pc.status === 'active'
        );

        if (!isAlreadyPurchased) {
            user.purchasedCourses.push({
                courseId: course._id,
                price: course.priceNumber || 0,
                status: 'active'
            });
            await user.save();

            // Increment course students
            course.students = (course.students || 0) + 1;
            await course.save();

            // Create global purchase log (optional, depends on Purchase model)
            if (Purchase) {
                await Purchase.create({
                    userId: user._id,
                    userEmail: user.email,
                    userName: user.name,
                    courseId: course._id,
                    courseTitle: course.title,
                    coursePrice: course.priceNumber || 0,
                    status: 'completed',
                    paymentMethod: 'razorpay',
                    adminRevenue: course.priceNumber || 0,
                    platformFee: 0
                });
            }
        }

        res.json({ success: true, message: 'Payment verified and course unlocked' });

    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ message: 'Payment verification failed' });
    }
});

module.exports = router;
