// server/src/routes/admin/purchases.routes.js
const express = require('express');
const router = express.Router();
const requireAdmin = require('../../middleware/requireAdmin');
const User = require('../../models/User');
const Course = require('../../models/Course');
const InternshipApplication = require('../../models/InternshipApplication');

router.get('/purchases', requireAdmin, async (req, res, next) => {
    try {
        const [users, internshipApps] = await Promise.all([
            User.find({ purchasedCourses: { $exists: true, $ne: [] } }, { email: 1, name: 1, purchasedCourses: 1 }).lean(),
            InternshipApplication.find()
                .populate('userId', 'email name')
                .populate('internshipId', 'title')
                .lean()
        ]);

        // Batch-fetch all course titles
        const courseIdSet = new Set();
        users.forEach(u => (u.purchasedCourses || []).forEach(p => {
            if (p.courseId) courseIdSet.add(String(p.courseId));
        }));
        const courses = await Course.find({ _id: { $in: Array.from(courseIdSet) } }).select('title').lean();
        const courseMap = new Map(courses.map(c => [String(c._id), c.title]));

        const allPurchases = [];

        // Course purchases
        for (const user of users) {
            for (const p of user.purchasedCourses) {
                allPurchases.push({
                    userEmail: user.email,
                    userName: user.name,
                    courseTitle: courseMap.get(String(p.courseId)) || p.title || 'Course',
                    price: 149, // Fixed course price
                    status: p.status ?? 'active',
                    purchasedAt: p.purchasedAt ?? null,
                });
            }
        }

        // Internship enrollments
        for (const app of internshipApps) {
            if (app.userId) {
                allPurchases.push({
                    userEmail: app.userId.email || 'N/A',
                    userName: app.userId.name || 'N/A',
                    courseTitle: `Internship: ${app.internshipId?.title || 'Unknown Internship'}`,
                    price: 149, // Fixed internship application price
                    status: app.status ?? 'active',
                    purchasedAt: app.createdAt || null,
                });
            }
        }

        // Sort by purchasedAt descending so newest purchases show at the top
        allPurchases.sort((a, b) => new Date(b.purchasedAt || 0) - new Date(a.purchasedAt || 0));

        res.json({ purchases: allPurchases });
    } catch (err) { next(err); }
});

module.exports = router;
