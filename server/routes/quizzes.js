// server/routes/quizzes.js
const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const Course = require('../models/Course'); // Switch from Quiz to Course model
const User = require('../models/User');

// GET /api/quizzes/course/:courseId
router.get('/course/:courseId', requireAuth, async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // CHANGE: Fetch from Course model
    const course = await Course.findById(courseId).lean();
    if (!course) return res.status(404).json({ message: 'Course not found' });
    
    const quiz = course.quiz; // Embedded quiz
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const user = await User.findById(req.userId).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const purchased = (user.purchasedCourses || []).some(pc => String(pc.courseId) === String(courseId) && (pc.status || 'active') === 'active');
    if (!purchased) return res.status(403).json({ message: 'You must purchase this course' });

    const payload = {
      _id: quiz._id,
      title: quiz.title,
      estimatedMins: quiz.estimatedMins,
      passingPercentage: quiz.passingPercentage,
      // Map questions simply for display
      questions: (quiz.questions || []).map(q => ({
        _id: q._id,
        id: q._id || q.id,
        text: q.text || q.question,
        options: (q.options || []).map((o, idx) => ({ id: o.id ?? String(idx), text: o.text }))
      }))
    };

    return res.json({ quiz: payload });
  } catch (err) {
    console.error('GET QUIZ (quizzes.js) ERROR:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;