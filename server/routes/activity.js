// server/routes/activity.js
const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');

/**
 * GET /api/me/activity
 * Returns recent activity events (purchase, progress updates, certificates, streaks)
 */
router.get('/me/activity', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('purchasedCourses.courseId').populate('progress.courseId').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const events = [];

    // purchases (most recent first)
    (user.purchasedCourses || []).forEach(pc => {
      const course = pc.courseId && pc.courseId.title ? pc.courseId : {};
      events.push({
        id: `purchase_${pc.courseId}_${pc.purchasedAt ? new Date(pc.purchasedAt).getTime() : Date.now()}`,
        type: 'purchase',
        title: `Purchased: ${course.title || 'Course'}`,
        courseId: pc.courseId ? (pc.courseId._id || pc.courseId) : pc.courseId,
        time: pc.purchasedAt || pc.createdAt || new Date(),
        meta: { price: pc.price, courseTitle: course.title || '' }
      });
    });

    // progress items - use lastSeenAt and completedAt
    (user.progress || []).forEach(p => {
      const course = p.courseId && p.courseId.title ? p.courseId : {};
      if (p.completedAt) {
        events.push({
          id: `completed_${p.courseId}_${new Date(p.completedAt).getTime()}`,
          type: 'lesson_completed',
          title: `Completed: ${course.title || 'Course'}`,
          courseId: p.courseId,
          time: p.completedAt,
          meta: { percent: p.percent, courseTitle: course.title || '' }
        });
      } else if (p.lastSeenAt) {
        events.push({
          id: `progress_${p.courseId}_${new Date(p.lastSeenAt).getTime()}`,
          type: 'lesson_completed',
          title: `Viewed: ${course.title || 'Course'}`,
          courseId: p.courseId,
          time: p.lastSeenAt,
          meta: { percent: p.percent, courseTitle: course.title || '' }
        });
      }
    });

    // you may have stored certificates in user.certificates — include if present
    if (user.certificates && Array.isArray(user.certificates)) {
      user.certificates.forEach(c => {
        events.push({
          id: `cert_${c.courseId}_${new Date(c.issuedOn || Date.now()).getTime()}`,
          type: 'certificate_issued',
          title: `Certificate: ${c.title || ''}`,
          courseId: c.courseId,
          time: c.issuedOn || new Date(),
          meta: { filename: c.filename }
        });
      });
    }

    // optional: add a "streak" synthetic event if streak days > 0
    const daysSet = new Set();
    (user.progress || []).forEach(p => {
      if (p.lastSeenAt) {
        daysSet.add(new Date(p.lastSeenAt).toISOString().slice(0,10));
      }
    });
    if (daysSet.size) {
      events.push({
        id: `streak_${user._id}_${daysSet.size}`,
        type: 'streak',
        title: `Learning streak: ${daysSet.size} day${daysSet.size > 1 ? 's' : ''}`,
        courseId: null,
        time: new Date(),
        meta: { streakDays: daysSet.size }
      });
    }

    // sort descending by time
    events.sort((a,b) => new Date(b.time) - new Date(a.time));

    // limit to 30 recent events
    return res.json({ events: events.slice(0, 30) });
  } catch (err) {
    console.error('me.activity', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
