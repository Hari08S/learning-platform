// server/routes/quiz.js
const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const Quiz = require('../models/Quiz');
const Course = require('../models/Course');
const User = require('../models/User');

// GET quiz for course (only if purchased)
router.get('/courses/:courseId/quiz', requireAuth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const quiz = await Quiz.findOne({ courseId }).lean();
    if (!quiz) return res.status(404).json({ message: 'Quiz not found for this course' });

    if (!Array.isArray(quiz.questions) || quiz.questions.length < 5) {
      return res.status(400).json({ message: 'Quiz not available (not enough questions).' });
    }

    // verify purchase
    const user = await User.findById(req.userId);
    const purchased = (user.purchasedCourses || []).some(pc => String(pc.courseId) === String(courseId) && (pc.status || 'active') === 'active');
    if (!purchased) return res.status(403).json({ message: 'You must purchase the course to take the quiz' });

    const clientQ = quiz.questions.map(q => ({ id: q.id, question: q.question, choices: q.choices }));
    return res.json({ quiz: clientQ });
  } catch (err) {
    console.error('quiz.get', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST submit answers
router.post('/me/quiz/:courseId', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const { courseId } = req.params;
    const { answers } = req.body;
    if (!Array.isArray(answers)) return res.status(400).json({ message: 'Missing answers' });

    const [quiz, course, user] = await Promise.all([
      Quiz.findOne({ courseId }).lean(),
      Course.findById(courseId).lean(),
      User.findById(userId)
    ]);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const correctMap = {};
    quiz.questions.forEach(q => { correctMap[String(q.id)] = q.answerIndex; });

    let correctCount = 0;
    quiz.questions.forEach(q => {
      const entry = answers.find(a => String(a.id) === String(q.id));
      if (entry && Number(entry.selectedIndex) === Number(correctMap[String(q.id)])) correctCount++;
    });

    const total = quiz.questions.length;
    const percent = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const PASS_THRESHOLD = 50; // we'll treat >=50 as pass per your choice
    const passed = percent >= PASS_THRESHOLD;

    // update user progress
    let prog = user.progress.find(p => String(p.courseId) === String(courseId));
    if (!prog) {
      prog = { courseId, percent: 0, hoursLearned: 0, lastSeenAt: new Date(), completedLessons: [] };
      user.progress.push(prog);
    }

    prog.lastSeenAt = new Date();
    prog.percent = Math.max(prog.percent || 0, percent);

    if (passed) {
      prog.completedAt = prog.completedAt || new Date();
      // optional: mark all lessons completed
      // prog.completedLessons = course.curriculum.map(c => c.id);
    }

    await user.save();

    const savedUser = await User.findById(userId).populate('progress.courseId').lean();

    return res.json({ score: percent, passed, correctCount, total, progress: savedUser.progress || [] });
  } catch (err) {
    console.error('quiz.submit', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
