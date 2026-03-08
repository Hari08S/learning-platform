// server/src/routes/admin/dashboard.routes.js
const express = require('express');
const router = express.Router();
const requireAdmin = require('../../middleware/requireAdmin');
const User = require('../../models/User');
const Course = require('../../models/Course');

router.get('/dashboard', requireAdmin, async (req, res, next) => {
    try {
        const [totalUsers, totalAdmins, totalCourses] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            User.countDocuments({ role: 'admin' }),
            Course.countDocuments(),
        ]);

        const users = await User.find(
            { purchasedCourses: { $exists: true, $ne: [] } },
            { purchasedCourses: 1 }
        ).lean();

        let totalPurchases = 0;
        let totalRevenue = 0;
        let activePurchases = 0;

        users.forEach(user => {
            (user.purchasedCourses || []).forEach(p => {
                totalPurchases++;
                const isActive = p.status !== 'cancelled';
                if (isActive) {
                    activePurchases++;
                    const price = Number(p.price);
                    if (!Number.isNaN(price) && price > 0) totalRevenue += price;
                }
            });
        });

        res.json({
            stats: { totalUsers, totalAdmins, totalCourses, totalPurchases, activePurchases, totalRevenue },
        });
    } catch (err) { next(err); }
});

module.exports = router;
