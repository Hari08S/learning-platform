// server/routes/purchases.js
const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');

/**
 * Purchase routes (mounted at /api)
 *
 * POST   /api/purchases                    { courseId }                -> create (or reactivate) purchase
 * DELETE /api/purchases/:courseId          -> mark purchase cancelled (soft)
 * POST   /api/purchases/:courseId/restore  -> reactivate a cancelled purchase
 * GET    /api/me/purchases                 -> return user's purchase history (populated)
 * GET    /api/me/progress                  -> return aggregated progress + purchased courses (for dashboard)
 * PATCH  /api/me/progress                  { courseId, percent?, hoursLearned?, markComplete? } -> update progress
 */

// POST /api/purchases { courseId }
router.post('/purchases', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ message: 'Missing courseId' });

    const [user, course] = await Promise.all([
      User.findById(userId),
      Course.findById(courseId)
    ]);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Find existing purchase (if any)
    const existingIdx = user.purchasedCourses.findIndex(pc => String(pc.courseId) === String(course._id));
    const price = course.priceNumber || (typeof course.price === 'number' ? course.price : 0);

    if (existingIdx === -1) {
      // create new purchase subdoc
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

    // Ensure progress entry exists (or re-create)
    const progIdx = user.progress.findIndex(p => String(p.courseId) === String(course._id));
    if (progIdx === -1) {
      user.progress.push({ courseId: course._id, percent: 0, hoursLearned: 0, lastSeenAt: new Date() });
    }

    await user.save();

    // Return updated lists (populated)
    const savedUser = await User.findById(userId).populate('purchasedCourses.courseId').populate('progress.courseId').lean();

    return res.json({
      message: 'Purchased',
      purchasedCourses: savedUser.purchasedCourses || [],
      progress: savedUser.progress || []
    });
  } catch (err) {
    console.error('purchases.create', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/purchases/:courseId -> mark cancelled (soft delete)
router.delete('/purchases/:courseId', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const { courseId } = req.params;
    if (!courseId) return res.status(400).json({ message: 'Missing courseId' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const idx = user.purchasedCourses.findIndex(pc => String(pc.courseId) === String(courseId));
    if (idx === -1) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    // Mark cancelled (soft) and keep the record for history
    user.purchasedCourses[idx].status = 'cancelled';
    user.purchasedCourses[idx].cancelledAt = new Date();

    // Optionally remove progress entry so it doesn't show as active course
    const progIdx = user.progress.findIndex(p => String(p.courseId) === String(courseId));
    if (progIdx !== -1) {
      user.progress.splice(progIdx, 1);
    }

    await user.save();

    const savedUser = await User.findById(userId).populate('purchasedCourses.courseId').populate('progress.courseId').lean();

    return res.json({
      message: 'Purchase cancelled',
      purchasedCourses: savedUser.purchasedCourses || [],
      progress: savedUser.progress || []
    });
  } catch (err) {
    console.error('purchases.cancel', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/purchases/:courseId/restore -> set status = active again
router.post('/purchases/:courseId/restore', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const { courseId } = req.params;
    if (!courseId) return res.status(400).json({ message: 'Missing courseId' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const idx = user.purchasedCourses.findIndex(pc => String(pc.courseId) === String(courseId));
    if (idx === -1) return res.status(404).json({ message: 'Purchase not found' });

    user.purchasedCourses[idx].status = 'active';
    user.purchasedCourses[idx].purchasedAt = new Date();
    user.purchasedCourses[idx].cancelledAt = undefined;

    // ensure progress exists
    if (!user.progress.some(p => String(p.courseId) === String(courseId))) {
      user.progress.push({ courseId: courseId, percent: 0, hoursLearned: 0, lastSeenAt: new Date() });
    }

    await user.save();

    const savedUser = await User.findById(userId).populate('purchasedCourses.courseId').populate('progress.courseId').lean();

    return res.json({
      message: 'Purchase restored',
      purchasedCourses: savedUser.purchasedCourses || [],
      progress: savedUser.progress || []
    });
  } catch (err) {
    console.error('purchases.restore', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/me/purchases -> return purchasedCourses (including cancelled) + basic info
router.get('/me/purchases', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('purchasedCourses.courseId').populate('progress.courseId').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Normalize returned items so frontend gets consistent shape
    const purchased = (user.purchasedCourses || []).map(pc => {
      const courseObj = pc.courseId && pc.courseId.title ? pc.courseId : (pc.courseId || {});
      return {
        courseId: pc.courseId ? (pc.courseId._id || pc.courseId) : pc.courseId,
        title: courseObj.title || '',
        author: courseObj.author || '',
        img: courseObj.img || '/logo.png',
        price: pc.price != null ? pc.price : (courseObj.price || ''),
        status: pc.status || 'active',
        purchasedAt: pc.purchasedAt,
        cancelledAt: pc.cancelledAt || null
      };
    });

    return res.json({ purchasedCourses: purchased, progress: user.progress || [] });
  } catch (err) {
    console.error('me.purchases', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/me/progress  -> returns aggregated progress + purchased courses
router.get('/me/progress', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('purchasedCourses.courseId').populate('progress.courseId').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const activeCourses = (user.purchasedCourses || []).filter(pc => (pc.status || 'active') === 'active').length;
    const hoursLearned = (user.progress || []).reduce((s, p) => s + (p.hoursLearned || 0), 0);
    const completedCount = (user.progress || []).filter(p => p.completedAt).length;
    const streakDays = computeStreak(user.progress || []);

    res.json({
      purchasedCourses: user.purchasedCourses || [],
      progress: user.progress || [],
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

// PATCH /api/me/progress  { courseId, percent?, hoursLearned?, markComplete? }
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
    res.json({ progress: user.progress });
  } catch (err) {
    console.error('me.progress.patch', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

function computeStreak(progress) {
  // count distinct days with activity in progress.lastSeenAt
  const days = new Set();
  (progress || []).forEach(p => {
    if (p.lastSeenAt) {
      const d = new Date(p.lastSeenAt);
      const key = d.toISOString().slice(0, 10);
      days.add(key);
    }
  });
  return days.size;
}

module.exports = router;
