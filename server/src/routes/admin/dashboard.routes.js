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
                // Count as revenue only if not cancelled
                const isValid = p.status !== 'cancelled';
                if (isValid) {
                    activePurchases++;
                    totalRevenue += 149;
                }
            });
        });

        internshipApps.forEach(app => {
            // Only count internship apps that have a createdAt (i.e., were actually submitted/paid)
            if (!app.createdAt) return;
            totalPurchases++;
            // Count as revenue if not withdrawn or cancelled
            const isValid = app.status !== 'withdrawn' && app.status !== 'cancelled';
            if (isValid) {
                activePurchases++;
                totalRevenue += 149;
            }
        });

        res.json({
            stats: { totalUsers, totalAdmins, totalCourses, totalInternships, totalPurchases, activePurchases, totalRevenue },
        });
    } catch (err) { next(err); }
});

module.exports = router;
