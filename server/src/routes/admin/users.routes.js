// server/src/routes/admin/users.routes.js
const express = require('express');
const router = express.Router();
const requireAdmin = require('../../middleware/requireAdmin');
const User = require('../../models/User');
const InternshipApplication = require('../../models/InternshipApplication');

// GET /api/admin/users
router.get('/users', requireAdmin, async (req, res, next) => {
    try {
        const users = await User.find()
            .select('_id name email role createdAt purchasedCourses progress badges streakDays')
            .sort({ createdAt: -1 })
            .lean();

        // Fetch internship enrollment counts per user
        const internshipCounts = await InternshipApplication.aggregate([
            { $group: {
                _id: '$userId',
                total: { $sum: 1 },
                active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
                completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
            }}
        ]);
        const internshipMap = {};
        internshipCounts.forEach(ic => {
            internshipMap[String(ic._id)] = ic;
        });

        res.json({
            users: users.map(u => {
                const uid = String(u._id);
                const intStats = internshipMap[uid] || { total: 0, active: 0, completed: 0 };
                return {
                    _id: uid,
                    name: u.name,
                    email: u.email,
                    role: u.role,
                    createdAt: u.createdAt,
                    purchasedCourses: u.purchasedCourses || [],
                    progress: u.progress || [],
                    badges: u.badges || [],
                    streakDays: u.streakDays || 0,
                    internships: intStats,
                };
            }),
        });
    } catch (err) { next(err); }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', requireAdmin, async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete admin users' });
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'User deleted' });
    } catch (err) { next(err); }
});

// PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', requireAdmin, async (req, res, next) => {
    try {
        const { role } = req.body;
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).lean();
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ user: { id: String(user._id), name: user.name, email: user.email, role: user.role } });
    } catch (err) { next(err); }
});

module.exports = router;
