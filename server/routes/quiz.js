// server/routes/quiz.js
const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const QuizResult = require('../models/QuizResult');
const Course = require('../models/Course');
const User = require('../models/User');

const PASS_THRESHOLD = Number(process.env.QUIZ_PASS_THRESHOLD || 50);

/**
 * normalizeQuestionsFromDb(rawQuestions = [])
 * Produces an array of question objects with shape:
 * { _id: string, id: string, text: string, options: [{ id, text }], points: number, correctOptionId }
 */
function normalizeQuestionsFromDb(rawQuestions = []) {
  return (rawQuestions || []).map((q, qi) => {
    const qId = q._id != null ? String(q._id) : (q.id != null ? String(q.id) : `q${qi + 1}`);

    let options = [];
    if (Array.isArray(q.options) && q.options.length) {
      options = q.options.map((o, idx) => {
        if (typeof o === 'string') return { id: String(idx), text: o };
        return {
          id: o.id != null ? String(o.id) : (o._id != null ? String(o._id) : String(idx)),
          text: o.text ?? o.label ?? String(o)
        };
      });
    }

    // support multiple legacy correct fields
    const correctOptionId = (q.correctOptionId != null)
      ? String(q.correctOptionId)
      : (q.correctOption != null ? String(q.correctOption) : (q.answer != null ? String(q.answer) : null));

    return {
      _id: qId,
      id: qId,
      text: q.text ?? q.question ?? `Question ${qi + 1}`,
      options,
      points: Number(q.points || 1),
      correctOptionId
    };
  });
}

/**
 * GET quiz metadata for a course
 * GET /api/courses/:courseId/quiz
 */
router.get('/courses/:courseId/quiz', requireAuth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).lean();
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const quizDoc = course.quiz;
    if (!quizDoc) return res.status(404).json({ message: 'Quiz not found for this course' });

    // Basic purchased check (if you track in User.purchasedCourses or similar)
    const user = await User.findById(req.userId).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const purchased = (user.purchasedCourses || []).some(pc => String(pc.courseId) === String(courseId) && (pc.status || 'active') === 'active');
    if (!purchased) return res.status(403).json({ message: 'You must purchase this course' });

    const normalizedQuestions = normalizeQuestionsFromDb(quizDoc.questions || []);

    const cleanQuiz = {
      _id: quizDoc._id ?? `quiz-${course._id}`,
      title: quizDoc.title ?? `${course.title} - Quiz`,
      passingPercentage: quizDoc.passingPercentage ?? quizDoc.passingScore ?? PASS_THRESHOLD,
      estimatedMins: quizDoc.estimatedMins ?? 0,
      questionCount: normalizedQuestions.length,
      questions: normalizedQuestions.map((q, index) => ({
        _id: q._id,
        id: q._id,
        text: q.text,
        options: (q.options || []).map(o => ({ id: o.id, text: o.text })),
        index
      }))
    };

    return res.json({ quiz: cleanQuiz });
  } catch (err) {
    console.error('GET QUIZ ERROR:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});


/**
 * Submit quiz answers
 * POST /api/me/quiz/:courseId
 * Body: { answers: [ { id: questionId, selectedOptionId: '...', selectedIndex: 0 } ], timeTakenSeconds?: Number }
 */
router.post(['/me/quiz/:courseId', '/me/quizzes/:courseId'], requireAuth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { answers = [], timeTakenSeconds = 0 } = req.body;
    const userId = req.userId;

    if (!Array.isArray(answers)) return res.status(400).json({ message: 'Invalid payload: answers must be array' });

    const course = await Course.findById(courseId).lean();
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const quizDoc = course.quiz;
    if (!quizDoc) return res.status(404).json({ message: 'Quiz not found for this course' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Prepare authoritative questions with correctOptionId
    const questions = normalizeQuestionsFromDb(quizDoc.questions || []);
    const questionMap = {};
    questions.forEach(q => { questionMap[String(q._id)] = q; });

    // Build submitted map from incoming answers array
    // Accept shapes: { id, selectedOptionId } or { questionId, selectedOptionId } or { id, selectedIndex }
    const submittedMap = {};
    answers.forEach(a => {
      const qid = a.id ?? a.questionId ?? a._id;
      if (qid == null) return;
      submittedMap[String(qid)] = {
        selectedOptionId: a.selectedOptionId != null ? String(a.selectedOptionId) : (a.selectedIndex != null ? String(a.selectedIndex) : null),
        raw: a
      };
    });

    // Score calculation: count points for each question where selectedOptionId matches correctOptionId
    let totalPoints = 0;
    let pointsCorrect = 0;
    const answersToStore = [];

    questions.forEach(q => {
      const qid = String(q._id);
      totalPoints += Number(q.points || 1);

      const sub = submittedMap[qid];
      let selectedOptionId = null;
      if (sub && sub.selectedOptionId != null) {
        selectedOptionId = String(sub.selectedOptionId);
      } else {
        // if front-end sent selectedIndex, try interpreting index as options[index].id
        if (sub && typeof sub.raw?.selectedIndex !== 'undefined' && q.options && q.options[sub.raw.selectedIndex]) {
          selectedOptionId = String(q.options[sub.raw.selectedIndex].id);
        }
      }

      const correctId = q.correctOptionId != null ? String(q.correctOptionId) : null;
      const isCorrect = (correctId != null && selectedOptionId != null && String(selectedOptionId) === correctId);

      if (isCorrect) pointsCorrect += Number(q.points || 1);

      answersToStore.push({
        questionId: qid,
        selectedOptionId: selectedOptionId,
        correct: !!isCorrect
      });
    });

    const percentage = totalPoints ? Math.round((pointsCorrect / totalPoints) * 100) : 0;
    const passingPercentage = quizDoc.passingPercentage ?? PASS_THRESHOLD;
    const passed = percentage >= passingPercentage;

    // Save QuizResult
    const quizResultPayload = {
      userId: user._id,
      quizId: quizDoc._id ?? course._id,
      courseId: course._id,
      score: pointsCorrect,
      total: totalPoints,
      percentage,
      passed,
      timeTakenSeconds: Number(timeTakenSeconds || 0),
      answers: answersToStore
    };

    const saved = await QuizResult.create(quizResultPayload);

    // Update user's progress: find existing progress entry for this course or create one
    try {
      let progressEntry = user.progress && Array.isArray(user.progress)
        ? user.progress.find(p => String(p.courseId) === String(course._id))
        : null;

      if (!progressEntry) {
        progressEntry = {
          courseId: course._id,
          percent: 0,
          hoursLearned: 0,
          lastSeenAt: new Date(),
          completedAt: null,
          completedLessons: [],
          quizPassed: false
        };
        user.progress = user.progress || [];
        user.progress.push(progressEntry);
      }

      // If passed, mark completed
      if (passed) {
        progressEntry.percent = 100;
        progressEntry.quizPassed = true;
        progressEntry.completedAt = new Date();
      } else {
        // if not passed, keep percent at 99 if already was 100-ish to indicate quiz pending
        progressEntry.quizPassed = progressEntry.quizPassed || false;
      }

      // Add time learned from quiz estimated minutes to hoursLearned if provided
      const quizMins = Number(quizDoc.estimatedMins || 0);
      if (quizMins > 0) {
        // store as hours float (existing schema uses hoursLearned as Number hrs)
        progressEntry.hoursLearned = (Number(progressEntry.hoursLearned || 0) + (quizMins / 60));
      }

      progressEntry.lastSeenAt = new Date();
      await user.save();
    } catch (uerr) {
      console.warn('Could not update user.progress after quiz submit', uerr);
    }

    // Return structured result to client
    return res.json({
      success: true,
      result: {
        id: saved._id,
        score: saved.score,
        total: saved.total,
        percentage: saved.percentage,
        passed: saved.passed,
        timeTakenSeconds: saved.timeTakenSeconds
      }
    });
  } catch (err) {
    console.error('QUIZ SUBMIT ERROR:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
