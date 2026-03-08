// server/src/routes/admin/profile.routes.js
const router = require('express').Router();
const requireAdmin = require('../../middleware/requireAdmin');

// PUT /api/admin/profile
router.put('/', requireAdmin, async (req, res, next) => {
    try {
        // BUG FIX: was using req.user.id which doesn't exist.
        // requireAdmin sets req.admin
        const admin = req.admin;
        if (!admin) return res.status(404).json({ message: 'Admin not found' });

        if (req.body.name) admin.name = req.body.name.trim();
        await admin.save();

        res.json({
            user: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
            },
        });
    } catch (err) { next(err); }
});

module.exports = router;
