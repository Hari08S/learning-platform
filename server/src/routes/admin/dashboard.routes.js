// server/src/routes/admin/dashboard.routes.js
const express = require('express');
const router = express.Router();
const requireAdmin = require('../../middleware/requireAdmin');
const User = require('../../models/User');
const Course = require('../../models/Course');
const Internship = require('../../models/Internship');
const InternshipApplication = require('../../models/InternshipApplication');

router.get('/dashboard', requireAdmin, async (req, res, next) => {
    try {
        const [totalUsers, totalAdmins, totalCourses, totalInternships] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            User.countDocuments({ role: 'admin' }),
            Course.countDocuments(),
            Internship.countDocuments(),
        ]);

        const users = await User.find(
            { purchasedCourses: { $exists: true, $ne: [] } },
            { purchasedCourses: 1 }
        ).lean();

        const internshipApps = await InternshipApplication.find().lean();

        let totalPurchases = 0;
        let totalRevenue = 0;
        let activePurchases = 0;

        users.forEach(user => {
            (user.purchasedCourses || []).forEach(p => {
                totalPurchases++;
                const isActive = p.status !== 'cancelled';
                if (isActive) {
                    activePurchases++;
                    totalRevenue += 149; // Fixed course pricing ₹149
                }
            });
        });

        internshipApps.forEach(app => {
            totalPurchases++;
            const isActive = app.status !== 'withdrawn' && app.status !== 'cancelled';
            if (isActive) {
                activePurchases++;
                totalRevenue += 149; // Fixed internship pricing ₹149
            }
        });

        res.json({
            stats: { totalUsers, totalAdmins, totalCourses, totalInternships, totalPurchases, activePurchases, totalRevenue },
        });
    } catch (err) { next(err); }
});

module.exports = router;
