// server/routes/progress.js
const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const QuizResult = require('../models/QuizResult');
const mongoose = require('mongoose');

// Cap hours per course to a realistic number (e.g. 50 hours max)
const MAX_HOURS_PER_COURSE = 50;

function toNormalizedKey(val) {
  if (val === undefined || val === null) return '';
  try {
    if (typeof val === 'object' && (val._id || val.id)) {
      const candidate = val._id ?? val.id;
      if (mongoose.Types.ObjectId.isValid(String(candidate))) {
        return String(mongoose.Types.ObjectId(String(candidate)));
      }
      return String(candidate);
    }
    if (mongoose.Types.ObjectId.isValid(String(val))) {
      return String(mongoose.Types.ObjectId(String(val)));
    }
  } catch (e) { /* ignore */ }
  return String(val);
}

/**
 * computeSummaryFromProgress (BACKEND GET /api/me/progress)
 * Only counts a course as complete when percent >= 100 AND quizPassed === true.
 * Also safely clamps hours instead of resetting them to 0.
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

    // ONLY count when both conditions are true
    if (pct >= 100 && quizPassed) {
      completedCourseIds.add(cid);
    }

    // Sanitize hours
    let h = Number(p.hoursLearned || 0);
    if (!isFinite(h) || h < 0) h = 0;
    if (h > MAX_HOURS_PER_COURSE) h = MAX_HOURS_PER_COURSE; // clamp, don't zero
    hoursLearned += h;
  });

  return { completedCount: completedCourseIds.size, hoursLearned };
}

/**
 * Flexible course resolver factory
 */
async function resolveCourseMetaFactory() {
  const cache = new Map();
  async function resolve(candidate) {
    if (candidate === undefined || candidate === null || candidate === '') return null;
    let key = (typeof candidate === 'object') ? String(candidate._id ?? candidate.id ?? candidate) : String(candidate);
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
      try { courseObj = await Course.findOne({ $or: [{ legacyId: key }, { id: key }, { slug: key }] }).lean(); } catch (e) { /* ignore */ }
    }

    let meta = null;
    if (courseObj) {
      meta = {
        _id: String(courseObj._id || key),
        title: courseObj.title || 'Untitled',
        img: courseObj.img || '/logo.png',
        author: courseObj.author || 'Author'
      };
    }
    cache.set(key, meta);
    return meta;
  }
  return resolve;
}

/**
 * GET /api/me/progress
 *
 * Returns:
 * - purchasedCourses: enriched purchases (includes cancelled/restored purchases)
 * - progress: sanitized progress list
 * - completedCount/hoursLearned/streakDays: summary values computed from sanitized progress
 *
 * Note: This endpoint returns ALL purchases (no filtering to only 'active') so UIs that display history
 * can show cancelled/restored entries. Purchases that are totally invalid (no courseId and no title) are dropped.
 */
router.get('/progress', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Keep all purchases (do NOT drop cancelled ones) so UIs that show history can render them.
    const rawPurchased = Array.isArray(user.purchasedCourses) ? user.purchasedCourses : [];
    const purchasedCourses = rawPurchased;

    // SANITIZE: Clean up the progress list before sending
    let progressList = Array.isArray(user.progress) ? user.progress : [];
    progressList = progressList.map(p => {
      let h = Number(p.hoursLearned || 0);
      if (!isFinite(h) || h < 0) h = 0;
      if (h > MAX_HOURS_PER_COURSE) h = MAX_HOURS_PER_COURSE; // clamp
      return { ...p, hoursLearned: h, quizPassed: !!p.quizPassed };
    });

    // Calculate Clean Summary using the stricter rule (percent >=100 && quizPassed)
    const { completedCount, hoursLearned } = computeSummaryFromProgress(progressList);
    const streakDays = Number(user.streakDays || 0);

    const resolveCourseMeta = await resolveCourseMetaFactory();

    const enrichedPurchasesTemp = await Promise.all(purchasedCourses.map(async pc => {
      const purchase = pc || {};

      // Try embedded course object first
      if (purchase.courseId && typeof purchase.courseId === 'object' && (purchase.courseId.title || purchase.courseId._id)) {
        const c = purchase.courseId;
        return {
          ...purchase,
          courseMeta: {
            _id: String(c._id ?? c.id ?? ''),
            title: c.title || purchase.title || 'Untitled',
            img: c.img || purchase.img || '/logo.png',
            author: c.author || purchase.author || 'Author'
          }
        };
      }

      const candidate = purchase.courseId ?? null;
      const candidateKey = candidate && typeof candidate === 'object'
        ? (candidate._id ?? candidate.id ?? String(candidate))
        : (candidate ? String(candidate) : null);

      const hasTitle = purchase.title && String(purchase.title).trim().length > 0;
      if (!candidateKey && !hasTitle) {
        // totally invalid purchase (no id and no title) -> drop
        return null;
      }

      let meta = null;
      if (candidateKey) meta = await resolveCourseMeta(candidateKey);

      if (!meta && !hasTitle) return null;

      if (!meta) {
        // fallback: use title/img from the purchase itself
        return {
          ...purchase,
          courseMeta: {
            _id: candidateKey || '',
            title: purchase.title || 'Untitled',
            img: purchase.img || '/logo.png',
            author: purchase.author || 'Author'
          }
        };
      }

      // If meta found, attach it
      return { ...purchase, courseMeta: meta };
    }));

    // drop any nulls produced for totally-invalid purchases
    const enrichedPurchases = (enrichedPurchasesTemp || []).filter(Boolean);

    return res.json({
      purchasedCourses: enrichedPurchases,
      progress: progressList,
      completedCount,
      hoursLearned,
      streakDays
    });
  } catch (err) {
    console.error('GET /api/me/progress error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/me/heartbeat
 *
 * Body: { courseId: "<id>", seconds: <number> }
 *
 * Records active learning time for a course for the current user.
 * - seconds is the number of seconds of activity (integer)
 * - endpoint updates user's progress entry (hoursLearned) and lastSeenAt
 * - clamps per-course hours to MAX_HOURS_PER_COURSE
 * - updates user's lastActiveAt and streakDays
 */
router.post('/heartbeat', requireAuth, async (req, res) => {
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

    // Ensure progress array exists
    if (!Array.isArray(user.progress)) user.progress = [];

    // Try to find progress entry for this course
    let entry = user.progress.find(p => {
      try {
        return toNormalizedKey(p.courseId) === cidKey;
      } catch (e) {
        return false;
      }
    });

    if (!entry) {
      // create a new progress entry (percent=0)
      entry = {
        courseId: cidKey,
        percent: 0,
        hoursLearned: 0,
        completedLessons: [],
        quizPassed: false,
        lastSeenAt: null,
        completedAt: null
      };
      user.progress.push(entry);
    }

    // add seconds -> hours
    const addHours = sec / 3600;
    entry.hoursLearned = Number(entry.hoursLearned || 0) + addHours;

    // clamp
    if (!isFinite(entry.hoursLearned) || entry.hoursLearned < 0) entry.hoursLearned = 0;
    if (entry.hoursLearned > MAX_HOURS_PER_COURSE) entry.hoursLearned = MAX_HOURS_PER_COURSE;

    entry.lastSeenAt = new Date();

    // Persist user.progress and update lastActiveAt / streakDays
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // 00:00 today
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // compute/initialize lastActiveAt/streakDays
    const prevActive = user.lastActiveAt ? new Date(user.lastActiveAt) : null;
    if (!prevActive) {
      user.streakDays = 1;
    } else {
      const prevDateOnly = new Date(prevActive.getFullYear(), prevActive.getMonth(), prevActive.getDate());
      if (prevDateOnly.getTime() === today.getTime()) {
        // same day -> nothing to change
      } else if (prevDateOnly.getTime() === yesterday.getTime()) {
        user.streakDays = (Number(user.streakDays || 0) || 0) + 1;
      } else {
        user.streakDays = 1;
      }
    }
    user.lastActiveAt = now;

    await user.save();

    // return updated entry and summary
    return res.json({
      progressEntry: {
        courseId: entry.courseId,
        percent: entry.percent,
        hoursLearned: entry.hoursLearned,
        lastSeenAt: entry.lastSeenAt,
        quizPassed: !!entry.quizPassed
      },
      streakDays: Number(user.streakDays || 0)
    });
  } catch (err) {
    console.error('POST /api/me/heartbeat error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/me/refresh-progress
 *
 * Rebuilds/cleans the user's progress array from existing progress & quiz results,
 * deduplicates by courseId, sanitizes hours, and writes back to DB.
 */
router.post('/refresh-progress', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 1. Clean existing progress (Remove duplicates & fix hours)
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
        quizPassed: false
      };

      // Take max percent
      existing.percent = Math.max(existing.percent, Number(p.percent || 0));

      // Sanitize hours & clamp to MAX
      let h = Number(p.hoursLearned || 0);
      if (!isFinite(h) || h < 0) h = 0;
      if (h > MAX_HOURS_PER_COURSE) h = MAX_HOURS_PER_COURSE;
      existing.hoursLearned = Math.max(existing.hoursLearned, h);

      if (p.quizPassed) existing.quizPassed = true;
      if (p.completedAt) existing.completedAt = p.completedAt;
      if (p.lastSeenAt) existing.lastSeenAt = p.lastSeenAt;

      // Merge lessons
      const oldL = (p.completedLessons || []).map(String);
      const curL = (existing.completedLessons || []).map(String);
      existing.completedLessons = Array.from(new Set([...oldL, ...curL]));

      cleanMap.set(key, existing);
    });

    // 2. Incorporate Quiz Results (do NOT force percent to 100)
    const results = await QuizResult.find({ userId }).lean();
    results.forEach(r => {
      const key = toNormalizedKey(r.courseId);
      if (!key) return;
      const entry = cleanMap.get(key) || {
        courseId: key,
        percent: 0,
        hoursLearned: 0,
        completedLessons: [],
        quizPassed: false
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

    // Update DB
    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: { progress: newProgressList } },
      { new: true }
    );

    // Recalculate summary from CLEAN list (uses percent >=100 && quizPassed)
    const { completedCount, hoursLearned } = computeSummaryFromProgress(updated.progress);

    return res.json({ success: true, progress: updated.progress, completedCount, hoursLearned });
  } catch (err) {
    console.error('POST /refresh-progress error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
