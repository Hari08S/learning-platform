const express = require('express');
const router = express.Router();
const User = require('../models/User');
const requireAuth = require('../middleware/auth');

// Helper to compute level
const getLevel = (xp) => Math.floor(xp / 100) + 1;

// GET /api/me/xp
router.get('/me/xp', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.userId).lean();
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Calculate rank
        const rankCount = await User.countDocuments({ xp: { $gt: user.xp || 0 } });
        const rank = rankCount + 1;

        res.json({
            xp: user.xp || 0,
            level: getLevel(user.xp || 0),
            rank
        });
    } catch (error) {
        console.error('Error fetching XP:', error);
        res.status(500).json({ message: 'Server error fetching XP' });
    }
});

// POST /api/me/xp/add
router.post('/me/xp/add', requireAuth, async (req, res) => {
    try {
        const { amount, reason } = req.body;
        if (!amount || isNaN(amount)) {
            return res.status(400).json({ message: 'Invalid XP amount' });
        }

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.xp = (user.xp || 0) + Number(amount);
        await user.save();

        res.json({ success: true, xp: user.xp, level: getLevel(user.xp), reason });
    } catch (error) {
        console.error('Error adding XP:', error);
        res.status(500).json({ message: 'Server error adding XP' });
    }
});

// GET /api/leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const topUsers = await User.find({})
            .sort({ xp: -1 })
            .limit(10)
            .select('name xp avatar')
            .lean();

        const leaderboard = topUsers.map((u, index) => ({
            _id: u._id,
            name: u.name,
            avatar: u.avatar || null,
            xp: u.xp || 0,
            level: getLevel(u.xp || 0),
            rank: index + 1
        }));

        res.json(leaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ message: 'Server error fetching leaderboard' });
    }
});

module.exports = router;
