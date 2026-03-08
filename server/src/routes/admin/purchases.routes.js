// server/src/routes/admin/purchases.routes.js
const express = require('express');
const router = express.Router();
const requireAdmin = require('../../middleware/requireAdmin');
const User = require('../../models/User');
const Course = require('../../models/Course');

router.get('/purchases', requireAdmin, async (req, res, next) => {
    try {
        const users = await User.find(
            { purchasedCourses: { $exists: true, $ne: [] } },
            { email: 1, name: 1, purchasedCourses: 1 }
        ).lean();

        // Batch-fetch all course titles
        const courseIdSet = new Set();
        users.forEach(u => (u.purchasedCourses || []).forEach(p => {
            if (p.courseId) courseIdSet.add(String(p.courseId));
        }));
        const courses = await Course.find({ _id: { $in: Array.from(courseIdSet) } }).select('title').lean();
        const courseMap = new Map(courses.map(c => [String(c._id), c.title]));

        const allPurchases = [];
        for (const user of users) {
            for (const p of user.purchasedCourses) {
                allPurchases.push({
                    userEmail: user.email,
                    userName: user.name,
                    courseTitle: courseMap.get(String(p.courseId)) || p.title || 'Course',
                    price: p.price ?? 0,
                    status: p.status ?? 'active',
                    purchasedAt: p.purchasedAt ?? null,
                });
            }
        }

        res.json({ purchases: allPurchases });
    } catch (err) { next(err); }
});

module.exports = router;
