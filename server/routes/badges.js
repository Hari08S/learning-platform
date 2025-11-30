// server/routes/badges.js
const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const User = require('../models/User');

/**
 * GET /api/me/badges
 * Returns badges (either stored in user.badges or computed)
 */
router.get('/me/badges', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    // If user.badges exists and not empty, return it (preferred)
    if (Array.isArray(user.badges) && user.badges.length > 0) {
      return res.json({ badges: user.badges });
    }

    // Otherwise compute a small set of badges from progress/hours
    const progress = user.progress || [];
    const hours = (progress || []).reduce((s, p) => s + (p.hoursLearned || 0), 0);

    const badges = [
      {
        id: 'first-lesson',
        title: 'First Lesson',
        icon: '📘',
        earnedAt: progress.some(p => (p.percent || 0) > 0) ? new Date().toISOString() : null,
        description: 'Started your first lesson.',
        progress: progress.some(p => (p.percent || 0) > 0) ? 1 : 0
      },
      {
        id: '5-hours',
        title: '5 Hours Learned',
        icon: '⏱',
        earnedAt: hours >= 5 ? new Date().toISOString() : null,
        description: 'Learn for 5 hours to earn this.',
        progress: Math.min(1, hours / 5)
      },
      {
        id: 'complete-course',
        title: 'Course Completed',
        icon: '🎓',
        earnedAt: progress.some(p => p.completedAt) ? (progress.find(p => p.completedAt).completedAt || new Date()).toISOString() : null,
        description: 'Complete a course to unlock.',
        progress: progress.some(p => p.completedAt) ? 1 : 0
      }
    ];

    return res.json({ badges });
  } catch (err) {
    console.error('me.badges', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
