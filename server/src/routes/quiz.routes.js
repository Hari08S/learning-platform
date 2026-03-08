// server/src/routes/quiz.routes.js
const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const QuizResult = require('../models/QuizResult');
const Course = require('../models/Course');
const User = require('../models/User');
const { QUIZ_PASS_THRESHOLD } = require('../config/constants');

/**
 * normalizeQuestionsFromDb
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
                    text: o.text ?? o.label ?? String(o),
                };
            });
        }

        const correctOptionId = (q.correctOptionId != null)
            ? String(q.correctOptionId)
            : (q.correctOption != null ? String(q.correctOption) : (q.answer != null ? String(q.answer) : null));

        return {
            _id: qId,
            id: qId,
            text: q.text ?? q.question ?? `Question ${qi + 1}`,
            options,
            points: Number(q.points || 1),
            correctOptionId,
        };
    });
}

/**
 * GET /api/courses/:courseId/quiz
 */
router.get('/courses/:courseId/quiz', requireAuth, async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const course = await Course.findById(courseId).lean();
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const quizDoc = course.quiz;
        if (!quizDoc) return res.status(404).json({ message: 'Quiz not found for this course' });

        const user = await User.findById(req.userId).lean();
        if (!user) return res.status(404).json({ message: 'User not found' });

        const purchased = (user.purchasedCourses || []).some(
            pc => String(pc.courseId) === String(courseId) && (pc.status || 'active') === 'active'
        );
        if (!purchased) return res.status(403).json({ message: 'You must purchase this course' });

        const normalizedQuestions = normalizeQuestionsFromDb(quizDoc.questions || []);

        const cleanQuiz = {
            _id: quizDoc._id ?? `quiz-${course._id}`,
            title: quizDoc.title ?? `${course.title} - Quiz`,
            passingPercentage: quizDoc.passingPercentage ?? QUIZ_PASS_THRESHOLD,
            estimatedMins: quizDoc.estimatedMins ?? 0,
            questionCount: normalizedQuestions.length,
            questions: normalizedQuestions.map((q, index) => ({
                _id: q._id,
                id: q._id,
                text: q.text,
                options: (q.options || []).map(o => ({ id: o.id, text: o.text })),
                index,
            })),
        };

        return res.json({ quiz: cleanQuiz });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/quizzes/course/:courseId
 * Legacy quiz fetch endpoint
 */
router.get('/quizzes/course/:courseId', requireAuth, async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const course = await Course.findById(courseId).lean();
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const quiz = course.quiz;
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        const user = await User.findById(req.userId).lean();
        if (!user) return res.status(404).json({ message: 'User not found' });

        const purchased = (user.purchasedCourses || []).some(
            pc => String(pc.courseId) === String(courseId) && (pc.status || 'active') === 'active'
        );
        if (!purchased) return res.status(403).json({ message: 'You must purchase this course' });

        const payload = {
            _id: quiz._id,
            title: quiz.title,
            estimatedMins: quiz.estimatedMins,
            passingPercentage: quiz.passingPercentage,
            questions: (quiz.questions || []).map(q => ({
                _id: q._id,
                id: q._id || q.id,
                text: q.text || q.question,
                options: (q.options || []).map((o, idx) => ({ id: o.id ?? String(idx), text: o.text })),
            })),
        };

        return res.json({ quiz: payload });
    } catch (err) {
        next(err);
    }
});

/**
 * POST /api/me/quiz/:courseId  (also /api/me/quizzes/:courseId)
 * Submit quiz answers
 */
router.post(['/me/quiz/:courseId', '/me/quizzes/:courseId'], requireAuth, async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const { answers = [], timeTakenSeconds = 0 } = req.body;
        const userId = req.userId;

        if (!Array.isArray(answers)) {
            return res.status(400).json({ message: 'Invalid payload: answers must be array' });
        }

        const course = await Course.findById(courseId).lean();
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const quizDoc = course.quiz;
        if (!quizDoc) return res.status(404).json({ message: 'Quiz not found for this course' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const questions = normalizeQuestionsFromDb(quizDoc.questions || []);
        const questionMap = {};
        questions.forEach(q => { questionMap[String(q._id)] = q; });

        const submittedMap = {};
        answers.forEach(a => {
            const qid = a.id ?? a.questionId ?? a._id;
            if (qid == null) return;
            submittedMap[String(qid)] = {
                selectedOptionId: a.selectedOptionId != null
                    ? String(a.selectedOptionId)
                    : (a.selectedIndex != null ? String(a.selectedIndex) : null),
                raw: a,
            };
        });

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
            } else if (sub && typeof sub.raw?.selectedIndex !== 'undefined' && q.options && q.options[sub.raw.selectedIndex]) {
                selectedOptionId = String(q.options[sub.raw.selectedIndex].id);
            }

            const correctId = q.correctOptionId != null ? String(q.correctOptionId) : null;
            const isCorrect = (correctId != null && selectedOptionId != null && String(selectedOptionId) === correctId);

            if (isCorrect) pointsCorrect += Number(q.points || 1);

            answersToStore.push({
                questionId: qid,
                selectedOptionId,
                correct: !!isCorrect,
            });
        });

        const percentage = totalPoints ? Math.round((pointsCorrect / totalPoints) * 100) : 0;
        const passingPercentage = quizDoc.passingPercentage ?? QUIZ_PASS_THRESHOLD;
        const passed = percentage >= passingPercentage;

        const saved = await QuizResult.create({
            userId: user._id,
            quizId: quizDoc._id ?? course._id,
            courseId: course._id,
            score: pointsCorrect,
            total: totalPoints,
            percentage,
            passed,
            timeTakenSeconds: Number(timeTakenSeconds || 0),
            answers: answersToStore,
        });

        // Update user progress
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
                    quizPassed: false,
                };
                user.progress = user.progress || [];
                user.progress.push(progressEntry);
            }

            if (passed) {
                progressEntry.percent = 100;
                progressEntry.quizPassed = true;
                progressEntry.completedAt = new Date();
            } else {
                progressEntry.quizPassed = progressEntry.quizPassed || false;
            }

            const quizMins = Number(quizDoc.estimatedMins || 0);
            if (quizMins > 0) {
                progressEntry.hoursLearned = (Number(progressEntry.hoursLearned || 0) + (quizMins / 60));
            }

            progressEntry.lastSeenAt = new Date();
            await user.save();
        } catch (uerr) {
            console.warn('Could not update user.progress after quiz submit', uerr);
        }

        return res.json({
            success: true,
            result: {
                id: saved._id,
                score: saved.score,
                total: saved.total,
                percentage: saved.percentage,
                passed: saved.passed,
                timeTakenSeconds: saved.timeTakenSeconds,
            },
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/me/quiz-results/:courseId
 * Get quiz results for the current user for a specific course
 */
router.get('/me/quiz-results/:courseId', requireAuth, async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const results = await QuizResult.find({
            userId: req.userId,
            courseId,
        }).sort({ createdAt: -1 }).lean();

        return res.json({ results });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
