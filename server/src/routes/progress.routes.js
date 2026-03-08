// server/src/routes/progress.routes.js
const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const QuizResult = require('../models/QuizResult');
const mongoose = require('mongoose');
const { toNormalizedKey } = require('../utils/helpers');
const { MAX_HOURS_PER_COURSE } = require('../config/constants');

/**
 * computeSummaryFromProgress
 */
function computeSummaryFromProgress(progressList = []) {
    const completedCourseIds = new Set();
    let hoursLearned = 0;

    (progressList || []).forEach(p => {
        if (!p || !p.courseId) return;
        const cid = toNormalizedKey(p.courseId);
        if (!cid) return;

        const pct = Number(p.percent || 0);
        const quizPassed = !!p.quizPassed;

        if (pct >= 100 && quizPassed) {
            completedCourseIds.add(cid);
        }

        let h = Number(p.hoursLearned || 0);
        if (!isFinite(h) || h < 0) h = 0;
        if (h > MAX_HOURS_PER_COURSE) h = MAX_HOURS_PER_COURSE;
        hoursLearned += h;
    });

    return { completedCount: completedCourseIds.size, hoursLearned };
}

/**
 * Course meta resolver factory
 */
async function resolveCourseMetaFactory() {
    const cache = new Map();
    async function resolve(candidate) {
        if (candidate === undefined || candidate === null || candidate === '') return null;
        let key = (typeof candidate === 'object')
            ? String(candidate._id ?? candidate.id ?? candidate)
            : String(candidate);
        if (!key) return null;
        if (cache.has(key)) return cache.get(key);

        let courseObj = null;
        try {
            if (mongoose.Types.ObjectId.isValid(key)) courseObj = await Course.findById(key).lean();
        } catch (e) { /* ignore */ }

        if (!courseObj) {
            try { courseObj = await Course.findOne({ _id: key }).lean(); } catch (e) { /* ignore */ }
        }
        if (!courseObj) {
            try {
                courseObj = await Course.findOne({
                    $or: [{ legacyId: key }, { id: key }, { slug: key }],
                }).lean();
            } catch (e) { /* ignore */ }
        }

        let meta = null;
        if (courseObj) {
            meta = {
                _id: String(courseObj._id || key),
                title: courseObj.title || 'Untitled',
                img: courseObj.img || '/logo.png',
                author: courseObj.author || 'Author',
            };
        }
        cache.set(key, meta);
        return meta;
    }
    return resolve;
}

/**
 * GET /api/me/progress
 */
router.get('/progress', requireAuth, async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const user = await User.findById(userId).lean();
        if (!user) return res.status(404).json({ message: 'User not found' });

        const rawPurchased = Array.isArray(user.purchasedCourses) ? user.purchasedCourses : [];

        let progressList = Array.isArray(user.progress) ? user.progress : [];
        progressList = progressList.map(p => {
            let h = Number(p.hoursLearned || 0);
            if (!isFinite(h) || h < 0) h = 0;
            if (h > MAX_HOURS_PER_COURSE) h = MAX_HOURS_PER_COURSE;
            return { ...p, hoursLearned: h, quizPassed: !!p.quizPassed };
        });

        const { completedCount, hoursLearned } = computeSummaryFromProgress(progressList);
        const streakDays = Number(user.streakDays || 0);

        const resolveCourseMeta = await resolveCourseMetaFactory();

        const enrichedPurchasesTemp = await Promise.all(rawPurchased.map(async pc => {
            const purchase = pc || {};

            if (purchase.courseId && typeof purchase.courseId === 'object' && (purchase.courseId.title || purchase.courseId._id)) {
                const c = purchase.courseId;
                return {
                    ...purchase,
                    courseMeta: {
                        _id: String(c._id ?? c.id ?? ''),
                        title: c.title || purchase.title || 'Untitled',
                        img: c.img || purchase.img || '/logo.png',
                        author: c.author || purchase.author || 'Author',
                    },
                };
            }

            const candidate = purchase.courseId ?? null;
            const candidateKey = candidate && typeof candidate === 'object'
                ? (candidate._id ?? candidate.id ?? String(candidate))
                : (candidate ? String(candidate) : null);

            const hasTitle = purchase.title && String(purchase.title).trim().length > 0;
            if (!candidateKey && !hasTitle) return null;

            let meta = null;
            if (candidateKey) meta = await resolveCourseMeta(candidateKey);

            if (!meta && !hasTitle) return null;

            if (!meta) {
                return {
                    ...purchase,
                    courseMeta: {
                        _id: candidateKey || '',
                        title: purchase.title || 'Untitled',
                        img: purchase.img || '/logo.png',
                        author: purchase.author || 'Author',
                    },
                };
            }

            return { ...purchase, courseMeta: meta };
        }));

        const enrichedPurchases = (enrichedPurchasesTemp || []).filter(Boolean);

        return res.json({
            purchasedCourses: enrichedPurchases,
            progress: progressList,
            completedCount,
            hoursLearned,
            streakDays,
            currentCourseId: user.currentCourseId || null,
        });
    } catch (err) {
        next(err);
    }
});

/**
 * POST /api/me/heartbeat
 */
router.post('/heartbeat', requireAuth, async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const { courseId, seconds } = req.body || {};
        const sec = Math.max(0, Math.floor(Number(seconds || 0)));
        if (!courseId || sec <= 0) return res.status(400).json({ message: 'Invalid payload' });

        const cidKey = toNormalizedKey(courseId);
        if (!cidKey) return res.status(400).json({ message: 'Invalid courseId' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!Array.isArray(user.progress)) user.progress = [];

        let entry = user.progress.find(p => {
            try { return toNormalizedKey(p.courseId) === cidKey; } catch (e) { return false; }
        });

        if (!entry) {
            entry = {
                courseId: cidKey,
                percent: 0,
                hoursLearned: 0,
                completedLessons: [],
                quizPassed: false,
                lastSeenAt: null,
                completedAt: null,
            };
            user.progress.push(entry);
        }

        const addHours = sec / 3600;
        entry.hoursLearned = Number(entry.hoursLearned || 0) + addHours;
        if (!isFinite(entry.hoursLearned) || entry.hoursLearned < 0) entry.hoursLearned = 0;
        if (entry.hoursLearned > MAX_HOURS_PER_COURSE) entry.hoursLearned = MAX_HOURS_PER_COURSE;

        entry.lastSeenAt = new Date();

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
                user.streakDays = 1;
            }
        }
        user.lastActiveAt = now;
        user.currentCourseId = cidKey;

        await user.save();

        return res.json({
            progressEntry: {
                courseId: entry.courseId,
                percent: entry.percent,
                hoursLearned: entry.hoursLearned,
                lastSeenAt: entry.lastSeenAt,
                quizPassed: !!entry.quizPassed,
            },
            streakDays: Number(user.streakDays || 0),
        });
    } catch (err) {
        next(err);
    }
});

/**
 * POST /api/me/presence
 * Alias for heartbeat — used by presenceTracker.js on the frontend
 */
router.post('/presence', requireAuth, async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const { courseId, seconds } = req.body || {};
        const sec = Math.max(0, Math.floor(Number(seconds || 0)));

        // If no courseId or no seconds, just acknowledge
        if (!courseId || sec <= 0) {
            return res.json({ ok: true, message: 'Presence noted' });
        }

        // Otherwise forward to heartbeat logic
        req.body = { courseId, seconds: sec };
        // Reuse heartbeat logic:
        const cidKey = toNormalizedKey(courseId);
        if (!cidKey) return res.json({ ok: true });

        const user = await User.findById(userId);
        if (!user) return res.json({ ok: true });

        if (!Array.isArray(user.progress)) user.progress = [];

        let entry = user.progress.find(p => {
            try { return toNormalizedKey(p.courseId) === cidKey; } catch (e) { return false; }
        });

        if (!entry) {
            entry = {
                courseId: cidKey,
                percent: 0,
                hoursLearned: 0,
                completedLessons: [],
                quizPassed: false,
                lastSeenAt: null,
                completedAt: null,
            };
            user.progress.push(entry);
        }

        const addHours = sec / 3600;
        entry.hoursLearned = Number(entry.hoursLearned || 0) + addHours;
        if (!isFinite(entry.hoursLearned) || entry.hoursLearned < 0) entry.hoursLearned = 0;
        if (entry.hoursLearned > MAX_HOURS_PER_COURSE) entry.hoursLearned = MAX_HOURS_PER_COURSE;
        entry.lastSeenAt = new Date();

        user.lastActiveAt = new Date();
        user.currentCourseId = cidKey;
        await user.save();

        return res.json({ ok: true });
    } catch (err) {
        next(err);
    }
});

/**
 * POST /api/me/refresh-progress
 */
router.post('/refresh-progress', requireAuth, async (req, res, next) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId).lean();
        if (!user) return res.status(404).json({ message: 'User not found' });

        const existingProgress = Array.isArray(user.progress) ? user.progress : [];
        const cleanMap = new Map();

        existingProgress.forEach(p => {
            const key = toNormalizedKey(p.courseId);
            if (!key) return;

            const existing = cleanMap.get(key) || {
                courseId: key,
                percent: 0,
                hoursLearned: 0,
                completedLessons: [],
                quizPassed: false,
            };

            existing.percent = Math.max(existing.percent, Number(p.percent || 0));

            let h = Number(p.hoursLearned || 0);
            if (!isFinite(h) || h < 0) h = 0;
            if (h > MAX_HOURS_PER_COURSE) h = MAX_HOURS_PER_COURSE;
            existing.hoursLearned = Math.max(existing.hoursLearned, h);

            if (p.quizPassed) existing.quizPassed = true;
            if (p.completedAt) existing.completedAt = p.completedAt;
            if (p.lastSeenAt) existing.lastSeenAt = p.lastSeenAt;

            const oldL = (p.completedLessons || []).map(String);
            const curL = (existing.completedLessons || []).map(String);
            existing.completedLessons = Array.from(new Set([...oldL, ...curL]));

            cleanMap.set(key, existing);
        });

        const results = await QuizResult.find({ userId }).lean();
        results.forEach(r => {
            const key = toNormalizedKey(r.courseId);
            if (!key) return;
            const entry = cleanMap.get(key) || {
                courseId: key,
                percent: 0,
                hoursLearned: 0,
                completedLessons: [],
                quizPassed: false,
            };
            if (r.passed) {
                entry.quizPassed = true;
                entry.percent = Math.max(entry.percent, Number(r.percentage || 0));
                if (!entry.lastQuizAt) entry.lastQuizAt = r.takenAt || new Date();
            } else {
                entry.percent = Math.max(entry.percent, Number(r.percentage || 0));
            }
            cleanMap.set(key, entry);
        });

        const newProgressList = Array.from(cleanMap.values());

        const updated = await User.findByIdAndUpdate(
            userId,
            { $set: { progress: newProgressList } },
            { new: true }
        );

        const { completedCount, hoursLearned } = computeSummaryFromProgress(updated.progress);

        return res.json({ success: true, progress: updated.progress, completedCount, hoursLearned });
    } catch (err) {
        next(err);
    }
});

// Add Wishlist endpoint
router.post('/wishlist', requireAuth, async (req, res, next) => {
    try {
        const { courseId } = req.body;
        if (!courseId) return res.status(400).json({ message: 'CourseId required' });

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.wishlist = user.wishlist || [];
        const idx = user.wishlist.indexOf(String(courseId));
        if (idx !== -1) {
            user.wishlist.splice(idx, 1);
        } else {
            user.wishlist.push(String(courseId));
        }
        await user.save();
        res.json({ wishlist: user.wishlist });
    } catch (err) {
        next(err);
    }
});

router.get('/wishlist', requireAuth, async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).lean();
        res.json({ wishlist: user ? (user.wishlist || []) : [] });
    } catch (err) {
        next(err);
    }
});

// Add Weekly Goal endpoint
router.post('/goal', requireAuth, async (req, res, next) => {
    try {
        const { weeklyGoalMinutes } = req.body;
        const user = await User.findByIdAndUpdate(req.userId, { weeklyGoalMinutes: parseInt(weeklyGoalMinutes, 10) || 0 }, { new: true });
        res.json({ success: true, weeklyGoalMinutes: user.weeklyGoalMinutes });
    } catch (err) {
        next(err);
    }
});

router.get('/goal', requireAuth, async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).lean();
        res.json({ weeklyGoalMinutes: user ? (user.weeklyGoalMinutes || 0) : 0 });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
