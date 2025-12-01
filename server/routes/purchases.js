// server/routes/purchases.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');

/**
 * Helper: try to resolve a course reference (populated object or id/legacyId).
 * Returns course document (lean) or null.
 */
async function resolveCourseRef(ref) {
  // If ref is null/undefined -> nothing
  if (!ref) return null;

  // If ref looks like a populated course object with title, return it
  if (typeof ref === 'object' && ref.title) {
    // ensure it's lean-like (no mongoose doc methods)
    return (typeof ref.toObject === 'function') ? ref.toObject() : ref;
  }

  // If ref is a string or ObjectId-like, try find by _id
  const asString = String(ref);
  try {
    if (mongoose.Types.ObjectId.isValid(asString)) {
      const byId = await Course.findById(asString).lean();
      if (byId && byId.title) return byId;
    }
  } catch (e) {
    // ignore errors and continue to legacy lookup
  }

  // Try numeric legacyId (if ref contains digits)
  const maybeNum = Number(asString);
  if (!Number.isNaN(maybeNum)) {
    const byLegacy = await Course.findOne({ legacyId: maybeNum }).lean();
    if (byLegacy && byLegacy.title) return byLegacy;
  }

  // Nothing found
  return null;
}

/**
 * POST /api/purchases { courseId } -> create/reactivate purchase
 */
router.post('/purchases', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ message: 'Missing courseId' });

    const [user] = await Promise.all([User.findById(userId)]);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Try to resolve course (by id or legacyId)
    const course = await resolveCourseRef(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Find existing purchase (compare as strings)
    const existingIdx = user.purchasedCourses.findIndex(pc => String(pc.courseId) === String(course._id));
    const price = course.priceNumber || (typeof course.price === 'number' ? course.price : 0);

    if (existingIdx === -1) {
      // create new purchase subdoc (store ObjectId)
      user.purchasedCourses.push({
        courseId: course._id,
        price,
        purchasedAt: new Date(),
        status: 'active'
      });
    } else {
      // reactivate if previously cancelled; error if already active
      if ((user.purchasedCourses[existingIdx].status || 'active') === 'active') {
        return res.status(400).json({ message: 'Already purchased' });
      } else {
        user.purchasedCourses[existingIdx].status = 'active';
        user.purchasedCourses[existingIdx].purchasedAt = new Date();
        user.purchasedCourses[existingIdx].price = price;
        user.purchasedCourses[existingIdx].cancelledAt = undefined;
      }
    }

    // Ensure progress entry exists
    const progIdx = user.progress.findIndex(p => String(p.courseId) === String(course._id));
    if (progIdx === -1) {
      user.progress.push({ courseId: course._id, percent: 0, hoursLearned: 0, lastSeenAt: new Date() });
    }

    await user.save();

    const savedUser = await User.findById(userId).populate('purchasedCourses.courseId').populate('progress.courseId').lean();

    // Normalize & resolve any purchases that didn't populate
    const purchasedResolved = [];
    for (const pc of (savedUser.purchasedCourses || [])) {
      const resolvedCourse = await resolveCourseRef(pc.courseId);
      if (!resolvedCourse) continue; // skip orphan purchases
      purchasedResolved.push({
        courseId: String(resolvedCourse._id || pc.courseId),
        title: resolvedCourse.title || '',
        author: resolvedCourse.author || '',
        img: resolvedCourse.img || '/logo.png',
        price: pc.price != null ? pc.price : (resolvedCourse.price || ''),
        status: pc.status || 'active',
        purchasedAt: pc.purchasedAt,
        cancelledAt: pc.cancelledAt || null,
        raw: pc
      });
    }

    return res.json({
      message: 'Purchased',
      purchasedCourses: purchasedResolved,
      progress: savedUser.progress || []
    });
  } catch (err) {
    console.error('purchases.create', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * DELETE /api/purchases/:courseId -> soft-cancel purchase
 */
router.delete('/purchases/:courseId', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const { courseId } = req.params;
    if (!courseId) return res.status(400).json({ message: 'Missing courseId' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const idx = user.purchasedCourses.findIndex(pc => String(pc.courseId) === String(courseId));
    if (idx === -1) {
      // attempt to match by legacyId if direct match failed
      const maybeNum = Number(courseId);
      if (!Number.isNaN(maybeNum)) {
        const legacyIdx = user.purchasedCourses.findIndex(pc => String(pc.courseId) === String(maybeNum));
        if (legacyIdx !== -1) {
          user.purchasedCourses[legacyIdx].status = 'cancelled';
          user.purchasedCourses[legacyIdx].cancelledAt = new Date();
        } else {
          return res.status(404).json({ message: 'Purchase not found' });
        }
      } else {
        return res.status(404).json({ message: 'Purchase not found' });
      }
    } else {
      // normal case
      user.purchasedCourses[idx].status = 'cancelled';
      user.purchasedCourses[idx].cancelledAt = new Date();
    }

    // Optionally remove progress entry so it doesn't show as active course
    const progIdx = user.progress.findIndex(p => String(p.courseId) === String(courseId));
    if (progIdx !== -1) {
      user.progress.splice(progIdx, 1);
    }

    await user.save();

    const savedUser = await User.findById(userId).populate('purchasedCourses.courseId').populate('progress.courseId').lean();

    // Resolve and filter purchases
    const purchasedResolved = [];
    for (const pc of (savedUser.purchasedCourses || [])) {
      const resolvedCourse = await resolveCourseRef(pc.courseId);
      if (!resolvedCourse) continue;
      purchasedResolved.push({
        courseId: String(resolvedCourse._id || pc.courseId),
        title: resolvedCourse.title || '',
        author: resolvedCourse.author || '',
        img: resolvedCourse.img || '/logo.png',
        price: pc.price != null ? pc.price : (resolvedCourse.price || ''),
        status: pc.status || 'active',
        purchasedAt: pc.purchasedAt,
        cancelledAt: pc.cancelledAt || null,
        raw: pc
      });
    }

    return res.json({
      message: 'Purchase cancelled',
      purchasedCourses: purchasedResolved,
      progress: savedUser.progress || []
    });
  } catch (err) {
    console.error('purchases.cancel', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/purchases/:courseId/restore -> reactivate cancelled
 */
router.post('/purchases/:courseId/restore', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const { courseId } = req.params;
    if (!courseId) return res.status(400).json({ message: 'Missing courseId' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // find by exact or legacy
    let idx = user.purchasedCourses.findIndex(pc => String(pc.courseId) === String(courseId));
    if (idx === -1) {
      const maybeNum = Number(courseId);
      if (!Number.isNaN(maybeNum)) {
        idx = user.purchasedCourses.findIndex(pc => String(pc.courseId) === String(maybeNum));
      }
    }
    if (idx === -1) return res.status(404).json({ message: 'Purchase not found' });

    user.purchasedCourses[idx].status = 'active';
    user.purchasedCourses[idx].purchasedAt = new Date();
    user.purchasedCourses[idx].cancelledAt = undefined;

    // ensure progress exists
    const rawCourseRef = user.purchasedCourses[idx].courseId;
    const resolvedCourse = await resolveCourseRef(rawCourseRef);
    if (resolvedCourse && !user.progress.some(p => String(p.courseId) === String(resolvedCourse._id))) {
      user.progress.push({ courseId: resolvedCourse._id, percent: 0, hoursLearned: 0, lastSeenAt: new Date() });
    }

    await user.save();

    const savedUser = await User.findById(userId).populate('purchasedCourses.courseId').populate('progress.courseId').lean();

    // Resolve and filter purchases
    const purchasedResolved = [];
    for (const pc of (savedUser.purchasedCourses || [])) {
      const resolvedCourse2 = await resolveCourseRef(pc.courseId);
      if (!resolvedCourse2) continue;
      purchasedResolved.push({
        courseId: String(resolvedCourse2._id || pc.courseId),
        title: resolvedCourse2.title || '',
        author: resolvedCourse2.author || '',
        img: resolvedCourse2.img || '/logo.png',
        price: pc.price != null ? pc.price : (resolvedCourse2.price || ''),
        status: pc.status || 'active',
        purchasedAt: pc.purchasedAt,
        cancelledAt: pc.cancelledAt || null,
        raw: pc
      });
    }

    return res.json({
      message: 'Purchase restored',
      purchasedCourses: purchasedResolved,
      progress: savedUser.progress || []
    });
  } catch (err) {
    console.error('purchases.restore', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/me/purchases -> return purchasedCourses (including cancelled) + basic info
 */
router.get('/me/purchases', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('purchasedCourses.courseId').populate('progress.courseId').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    // For each purchasedCourses entry: try to resolve its course doc (populated or by id/legacyId)
    const purchasedResolved = [];
    for (const pc of (user.purchasedCourses || [])) {
      const resolved = await resolveCourseRef(pc.courseId);
      if (!resolved) {
        // skip orphaned purchase (this prevents Unknown/Untitled rows)
        continue;
      }
      purchasedResolved.push({
        courseId: String(resolved._id || pc.courseId),
        title: resolved.title || '',
        author: resolved.author || '',
        img: resolved.img || '/logo.png',
        price: pc.price != null ? pc.price : (resolved.price || ''),
        status: pc.status || 'active',
        purchasedAt: pc.purchasedAt,
        cancelledAt: pc.cancelledAt || null,
        raw: pc
      });
    }

    return res.json({ purchasedCourses: purchasedResolved, progress: user.progress || [] });
  } catch (err) {
    console.error('me.purchases', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/me/progress -> aggregated progress + purchased courses
 * (resolve purchases to real course docs like above)
 */
router.get('/me/progress', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('purchasedCourses.courseId').populate('progress.courseId').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Resolve purchased courses similarly (skip orphaned)
    const purchased = [];
    for (const pc of (user.purchasedCourses || [])) {
      const resolved = await resolveCourseRef(pc.courseId);
      if (!resolved) continue;
      purchased.push({
        courseId: String(resolved._id || pc.courseId),
        title: resolved.title || (pc.title || ''),
        author: resolved.author || '',
        img: resolved.img || '/logo.png',
        price: pc.price != null ? pc.price : (resolved.price || ''),
        status: pc.status || 'active',
        purchasedAt: pc.purchasedAt,
        cancelledAt: pc.cancelledAt || null,
        raw: pc
      });
    }

    // Normalize progress entries
    const progress = (user.progress || []).map(p => {
      const cid = p.courseId && (p.courseId._id || p.courseId) ? String(p.courseId._id || p.courseId) : String(p.courseId || '');
      const completedLessons = Array.isArray(p.completedLessons) ? p.completedLessons : [];
      return {
        courseId: cid,
        percent: typeof p.percent === 'number' ? p.percent : 0,
        hoursLearned: p.hoursLearned || 0,
        lastSeenAt: p.lastSeenAt || null,
        completedAt: p.completedAt || null,
        completedLessons
      };
    });

    // Recompute percent server-side where possible
    for (let i = 0; i < progress.length; i++) {
      try {
        const pr = progress[i];
        if (!pr || !pr.courseId) continue;
        const course = await Course.findById(pr.courseId).lean();
        const total = Array.isArray(course?.curriculum) ? course.curriculum.length : 0;
        const done = Array.isArray(pr.completedLessons) ? pr.completedLessons.length : 0;
        if (total > 0) pr.percent = Math.round((done / total) * 100);
      } catch (e) { /* ignore per-course errors */ }
    }

    const activeCourses = purchased.filter(pc => (pc.status || 'active') === 'active').length;
    const hoursLearned = progress.reduce((s, p) => s + (p.hoursLearned || 0), 0);
    const completedCount = progress.filter(p => p.completedAt).length;
    const streakDays = computeStreak(user.progress || []);

    return res.json({
      purchasedCourses: purchased,
      progress,
      activeCourses,
      hoursLearned,
      completedCount,
      streakDays
    });
  } catch (err) {
    console.error('me.progress', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/me/progress -> update progress entry
router.patch('/me/progress', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { courseId, percent, hoursLearned, markComplete } = req.body;
    if (!courseId) return res.status(400).json({ message: 'Missing courseId' });

    const p = user.progress.find(x => String(x.courseId) === String(courseId));
    if (!p) return res.status(404).json({ message: 'Progress record not found' });

    if (typeof percent === 'number') p.percent = Math.max(0, Math.min(100, percent));
    if (typeof hoursLearned === 'number') p.hoursLearned = (p.hoursLearned || 0) + hoursLearned;
    p.lastSeenAt = new Date();
    if (markComplete) p.completedAt = new Date();

    await user.save();
    return res.json({ progress: user.progress });
  } catch (err) {
    console.error('me.progress.patch', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

function computeStreak(progress) {
  const days = new Set();
  (progress || []).forEach(p => {
    if (p.lastSeenAt) {
      const d = new Date(p.lastSeenAt);
      days.add(d.toISOString().slice(0, 10));
    }
  });
  return days.size;
}

module.exports = router;
