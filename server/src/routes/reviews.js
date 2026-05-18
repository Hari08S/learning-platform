const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/User');
const requireAuth = require('../middleware/auth');

// GET /api/courses/:courseId/reviews
router.get('/:courseId/reviews', async (req, res) => {
    try {
        const reviews = await Review.find({ courseId: req.params.courseId })
            .populate('userId', 'name avatar') // populate user fields
            .sort({ createdAt: -1 })
            .limit(20);

        const formatted = reviews.map(r => ({
            _id: r._id,
            userName: r.userId ? r.userId.name : 'Unknown User',
            userAvatar: r.userId ? r.userId.avatar : null,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt
        }));

        // Calculate average
        const allReviews = await Review.find({ courseId: req.params.courseId }, 'rating');
        const avgRating = allReviews.length > 0
            ? (allReviews.reduce((sum, rev) => sum + rev.rating, 0) / allReviews.length).toFixed(1)
            : 0;

        res.json({ reviews: formatted, avgRating, totalReviews: allReviews.length });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/courses/:courseId/reviews
router.post('/:courseId/reviews', requireAuth, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const { courseId } = req.params;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        const user = await User.findById(req.userId);

        // Verify user completed course
        const progress = user.progress.find(p => String(p.courseId) === String(courseId));
        if (!progress || progress.percent < 100) {
            return res.status(403).json({ message: 'You must complete the course to review it' });
        }

        // Upsert review (one per user per course)
        const review = await Review.findOneAndUpdate(
            { userId: req.userId, courseId },
            {
                rating,
                comment: comment ? String(comment).substring(0, 300) : '',
                createdAt: new Date()
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.json({ success: true, review });
    } catch (error) {
        console.error('Error posting review:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
