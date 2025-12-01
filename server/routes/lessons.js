// server/routes/lessons.js
const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const Course = require('../models/Course');
const User = require('../models/User');

// GET module content
router.get('/courses/:courseId/module/:moduleId', requireAuth, async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const course = await Course.findById(courseId).lean();
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const item = (course.curriculum || []).find(ci => String(ci.id) === String(moduleId) || String(ci._id) === String(moduleId));
    if (!item) return res.status(404).json({ message: 'Module not found' });

    // require purchase
    const user = await User.findById(req.userId);
    const purchased = (user.purchasedCourses || []).some(pc => {
      const cid = pc.courseId && (pc.courseId._id || pc.courseId) ? String(pc.courseId._id || pc.courseId) : String(pc.courseId);
      return cid === String(courseId) && (pc.status || 'active') === 'active';
    });
    if (!purchased) return res.status(403).json({ message: 'You must purchase the course to view lessons' });

    return res.json({ module: item, courseTitle: course.title });
  } catch (err) {
    console.error('lessons.get', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST mark lesson done
// NOTE: marking lessons updates percent but DOES NOT auto-mark completedAt.
// completedAt will only be set when quiz is passed.
router.post('/me/progress/mark-lesson', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const { courseId, lessonId } = req.body;
    if (!courseId || typeof lessonId === 'undefined') return res.status(400).json({ message: 'Missing courseId or lessonId' });

    const [user, course] = await Promise.all([User.findById(userId), Course.findById(courseId)]);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const purchased = (user.purchasedCourses || []).some(pc => String(pc.courseId) === String(courseId) && (pc.status || 'active') === 'active');
    if (!purchased) return res.status(403).json({ message: 'You must purchase the course to mark lessons' });

    let prog = user.progress.find(p => String(p.courseId) === String(courseId));
    if (!prog) {
      prog = { courseId, percent: 0, hoursLearned: 0, lastSeenAt: new Date(), completedLessons: [] };
      user.progress.push(prog);
    }

    const lessonKey = String(lessonId);
    if (!((prog.completedLessons || []).map(String).includes(lessonKey))) {
      prog.completedLessons = prog.completedLessons || [];
      prog.completedLessons.push(lessonId);
    }

    const total = Array.isArray(course.curriculum) ? course.curriculum.length : 0;
    const done = (prog.completedLessons || []).length;
    prog.percent = total > 0 ? Math.round((done / total) * 100) : prog.percent;
    prog.lastSeenAt = new Date();

    // IMPORTANT: do not set prog.completedAt here even if percent >= 100.
    // The course will be "100% ready" but completion requires passing quiz.
    // However we keep percent and completedLessons so UI can show progress.

    await user.save();

    const savedUser = await User.findById(userId).populate('progress.courseId').lean();
    return res.json({ message: 'Lesson marked', progress: savedUser.progress || [] });
  } catch (err) {
    console.error('lessons.mark', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
