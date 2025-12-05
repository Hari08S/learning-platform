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

    // Normalize IDs to handle both _id and id
    const item = (course.curriculum || []).find(ci => String(ci.id ?? ci._id) === String(moduleId));
    if (!item) return res.status(404).json({ message: 'Module not found' });

    // Require purchase
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
router.post('/me/progress/mark-lesson', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const { courseId, lessonId } = req.body;
    if (!courseId || typeof lessonId === 'undefined') return res.status(400).json({ message: 'Missing courseId or lessonId' });

    const [user, course] = await Promise.all([User.findById(userId), Course.findById(courseId)]);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const purchased = (user.purchasedCourses || []).some(pc => {
        const cId = pc.courseId && (pc.courseId._id || pc.courseId) ? String(pc.courseId._id || pc.courseId) : String(pc.courseId);
        return cId === String(courseId) && (pc.status || 'active') === 'active';
    });
    
    if (!purchased) return res.status(403).json({ message: 'You must purchase the course to mark lessons' });

    // Find or create progress entry
    let prog = user.progress.find(p => String(p.courseId) === String(courseId));
    if (!prog) {
      prog = { courseId, percent: 0, hoursLearned: 0, lastSeenAt: new Date(), completedLessons: [] };
      user.progress.push(prog);
    }

    // Add lesson to completed list if not present
    const lessonKey = String(lessonId);
    const existingLessons = (prog.completedLessons || []).map(String);
    if (!existingLessons.includes(lessonKey)) {
      prog.completedLessons = prog.completedLessons || [];
      prog.completedLessons.push(lessonId);
    }

    // --- FIX STARTS HERE ---

    // 1. Calculate Total: Only count "lessons" (ignore quizzes in the denominator)
    // This allows the user to reach 100% by finishing all learning content.
    const curriculum = Array.isArray(course.curriculum) ? course.curriculum : [];
    const markableItems = curriculum.filter(item => item.type !== 'quiz'); 
    
    const total = markableItems.length; // Use this as the denominator
    
    // Count how many *markable* items the user has done
    // (We filter the user's completed list to ensure we match the IDs correctly)
    const markableIds = markableItems.map(m => String(m.id ?? m._id));
    const doneCount = (prog.completedLessons || []).filter(lid => markableIds.includes(String(lid))).length;

    // 2. Update Percent
    let newPercent = 0;
    if (total > 0) {
        newPercent = Math.round((doneCount / total) * 100);
    }
    if (newPercent > 100) newPercent = 100;
    
    prog.percent = newPercent;
    prog.lastSeenAt = new Date();

    // 3. Mark CompletedAt logic
    // If progress is 100%, we mark it as completed.
    // If you strictly require a quiz, you can check `hasQuiz` here. 
    // For now, we allow completion if lessons are done (common behavior).
    if (newPercent >= 100) {
        // If it was not marked complete before, mark it now.
        if (!prog.completedAt) {
            prog.completedAt = new Date();
        }
    }

    // --- FIX ENDS HERE ---

    await user.save();

    return res.json({ message: 'Lesson marked', progress: user.progress });
  } catch (err) {
    console.error('lessons.mark', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;