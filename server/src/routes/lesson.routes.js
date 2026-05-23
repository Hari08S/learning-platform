// server/src/routes/lesson.routes.js
const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const Course = require('../models/Course');
const User = require('../models/User');

/**
 * GET /api/courses/:courseId/module/:moduleId
 */
router.get('/courses/:courseId/module/:moduleId', requireAuth, async (req, res, next) => {
    try {
        const { courseId, moduleId } = req.params;
        const mongoose = require('mongoose');

        let course = null;
        if (mongoose.Types.ObjectId.isValid(courseId)) {
            course = await Course.findById(courseId).lean();
        } else {
            const numId = parseInt(courseId, 10);
            if (!isNaN(numId)) course = await Course.findOne({ legacyId: numId }).lean();
        }
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const item = (course.curriculum || []).find(ci => String(ci.id ?? ci._id) === String(moduleId));
        if (!item) return res.status(404).json({ message: 'Module not found' });

        // Require purchase — compare against resolved course._id
        const user = await User.findById(req.userId);
        const resolvedCourseId = String(course._id);
        const purchased = (user.purchasedCourses || []).some(pc => {
            const cid = pc.courseId && (pc.courseId._id || pc.courseId)
                ? String(pc.courseId._id || pc.courseId)
                : String(pc.courseId);
            return cid === resolvedCourseId && (pc.status || 'active') === 'active';
        });
        if (!purchased) return res.status(403).json({ message: 'You must purchase the course to view lessons' });

        // Check if already completed
        let isCompleted = false;
        const prog = (user.progress || []).find(p => String(p.courseId) === resolvedCourseId);
        if (prog && prog.completedLessons) {
            isCompleted = prog.completedLessons.map(String).includes(String(moduleId));
        }

        return res.json({ module: item, courseTitle: course.title, isCompleted });
    } catch (err) {
        next(err);
    }
});

/**
 * POST /api/me/progress/mark-lesson
 */
router.post('/me/progress/mark-lesson', requireAuth, async (req, res, next) => {
    try {
        const userId = req.userId;
        const { courseId, lessonId } = req.body;
        if (!courseId || typeof lessonId === 'undefined') {
            return res.status(400).json({ message: 'Missing courseId or lessonId' });
        }

        const mongoose = require('mongoose');
        const user = await User.findById(userId);

        let course = null;
        if (mongoose.Types.ObjectId.isValid(courseId)) {
            course = await Course.findById(courseId);
        } else {
            const numId = parseInt(courseId, 10);
            if (!isNaN(numId)) course = await Course.findOne({ legacyId: numId });
        }
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const resolvedCourseId = String(course._id);
        const purchased = (user.purchasedCourses || []).some(pc => {
            const cId = pc.courseId && (pc.courseId._id || pc.courseId)
                ? String(pc.courseId._id || pc.courseId)
                : String(pc.courseId);
            return cId === resolvedCourseId && (pc.status || 'active') === 'active';
        });
        if (!purchased) return res.status(403).json({ message: 'You must purchase the course to mark lessons' });

        // Find or create progress entry
        let prog = user.progress.find(p => String(p.courseId) === resolvedCourseId);
        if (!prog) {
            prog = { courseId: resolvedCourseId, percent: 0, hoursLearned: 0, lastSeenAt: new Date(), completedLessons: [] };
            user.progress.push(prog);
        }

        // Add lesson to completed list if not present
        const lessonKey = String(lessonId);
        const existingLessons = (prog.completedLessons || []).map(String);
        if (!existingLessons.includes(lessonKey)) {
            prog.completedLessons = prog.completedLessons || [];
            prog.completedLessons.push(lessonId);
        }

        // Calculate progress: only count "lessons" (ignore quizzes)
        const curriculum = Array.isArray(course.curriculum) ? course.curriculum : [];
        const markableItems = curriculum.filter(item => item.type !== 'quiz');
        const total = markableItems.length;
        const markableIds = markableItems.map(m => String(m.id ?? m._id));
        const doneCount = (prog.completedLessons || []).filter(lid => markableIds.includes(String(lid))).length;

        // NEW: Add hours for this lesson
        const lessonItem = curriculum.find(item => String(item.id ?? item._id) === lessonKey);
        if (lessonItem && lessonItem.mins && !existingLessons.includes(lessonKey)) {
            const addHours = Number(lessonItem.mins) / 60;
            prog.hoursLearned = (prog.hoursLearned || 0) + addHours;

            // Add XP for completing a lesson (20 XP)
            user.xp = (user.xp || 0) + 20;

            // Log activity: completing course lessons shows minutes in heatmap!
            try {
                const DailyActivity = require('../models/DailyActivity');
                const date = new Date().toISOString().split('T')[0];
                await DailyActivity.findOneAndUpdate(
                    { userId, date },
                    { $inc: { minutes: parseInt(lessonItem.mins, 10) || 10 } },
                    { new: true, upsert: true }
                );
            } catch (e) {
                console.error("Failed to auto-log DailyActivity inside lesson mark-done", e);
            }
        }

        let newPercent = 0;
        if (total > 0) newPercent = Math.round((doneCount / total) * 100);
        if (newPercent > 100) newPercent = 100;

        const wasAlreadyComplete = prog.percent >= 100;
        prog.percent = newPercent;
        prog.lastSeenAt = new Date();

        if (newPercent >= 100 && !prog.completedAt) {
            prog.completedAt = new Date();
            // Bonus XP for finishing the course! (100 XP)
            if (!wasAlreadyComplete) {
                user.xp = (user.xp || 0) + 100;
            }
        }

        // Streak logic
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const prevActive = user.lastActiveAt ? new Date(user.lastActiveAt) : null;
        if (!prevActive) {
            user.streakDays = 1;
        } else {
            const prevDateOnly = new Date(prevActive.getFullYear(), prevActive.getMonth(), prevActive.getDate());
            if (prevDateOnly.getTime() === today.getTime()) {
                // same day
            } else if (prevDateOnly.getTime() === yesterday.getTime()) {
                user.streakDays = (Number(user.streakDays || 0) || 0) + 1;
            } else {
                user.streakDays = 1; // reset
            }
        }
        user.lastActiveAt = now;


        await user.save();
        return res.json({ message: 'Lesson marked', progress: user.progress });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
