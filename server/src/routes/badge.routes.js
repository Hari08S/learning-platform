// server/src/routes/badge.routes.js
const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const User = require('../models/User');

router.get('/me/badges', requireAuth, async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).lean();
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (Array.isArray(user.badges) && user.badges.length > 0) {
            return res.json({ badges: user.badges });
        }

        const progress = user.progress || [];
        const hours = progress.reduce((s, p) => s + (p.hoursLearned || 0), 0);
        const completedCourses = progress.filter(p => p.completedAt && p.quizPassed).length;

        const badges = [
            { id: 'first-lesson', title: 'First Lesson', icon: '📘', earnedAt: progress.some(p => (p.percent || 0) > 0) ? new Date().toISOString() : null, description: 'Started your first lesson.', progress: progress.some(p => (p.percent || 0) > 0) ? 1 : 0 },
            { id: '5-hours', title: '5 Hours Learned', icon: '⏱️', earnedAt: hours >= 5 ? new Date().toISOString() : null, description: 'Learn for 5 hours.', progress: Math.min(1, hours / 5) },
            { id: 'complete-course', title: 'Course Completed', icon: '🎓', earnedAt: completedCourses >= 1 ? new Date().toISOString() : null, description: 'Complete a course.', progress: Math.min(1, completedCourses) },
            { id: 'three-courses', title: 'Triple Learner', icon: '🏆', earnedAt: completedCourses >= 3 ? new Date().toISOString() : null, description: 'Complete 3 courses.', progress: Math.min(1, completedCourses / 3) },
            { id: '20-hours', title: 'Dedicated Learner', icon: '🔥', earnedAt: hours >= 20 ? new Date().toISOString() : null, description: 'Study for 20 hours.', progress: Math.min(1, hours / 20) },
        ];

        return res.json({ badges });
    } catch (err) { next(err); }
});

module.exports = router;
