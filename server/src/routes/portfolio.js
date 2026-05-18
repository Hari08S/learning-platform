const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/portfolio/:username
router.get('/:username', async (req, res) => {
    try {
        const username = req.params.username;
        if (!username) return res.status(400).json({ message: 'Username is required' });

        // Username is derived from email prefix, e.g., john.doe from john.doe@email.com
        const user = await User.findOne({ email: new RegExp(`^${username}@`, 'i') }).select(
            'name xp streakDays progress badges certificates avatar createdAt'
        ).lean();

        if (!user) {
            return res.status(404).json({ message: 'Portfolio not found' });
        }

        const getLevel = (xp) => Math.floor(xp / 100) + 1;

        // Count completed courses
        const completedCoursesCount = (user.progress || []).filter(p => p.percent >= 100).length;
        const totalHours = (user.progress || []).reduce((acc, p) => acc + (p.hoursLearned || 0), 0).toFixed(1);

        const publicData = {
            name: user.name,
            avatar: user.avatar,
            xp: user.xp || 0,
            level: getLevel(user.xp || 0),
            streakDays: user.streakDays || 0,
            badges: user.badges || [],
            certificates: (user.certificates || []).map(c => c.title),
            completedCourses: completedCoursesCount,
            hoursLearned: totalHours,
            joinDate: user.createdAt
        };

        res.json(publicData);
    } catch (error) {
        console.error('Error fetching portfolio:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
