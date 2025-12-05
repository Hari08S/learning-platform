// server/routes/purchases.js
const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const mongoose = require('mongoose');

function isMeaningfulTitle(t) {
  if (!t) return false;
  const s = String(t).trim();
  if (!s) return false;
  const low = s.toLowerCase();
  if (low === 'untitled' || low === 'title' || low === 'n/a') return false;
  return true;
}

function isSentinelString(s) {
  if (!s && s !== 0) return true;
  const v = String(s).trim().toLowerCase();
  return v === '' || v === 'undefined' || v === 'null' || v === 'nan';
}

/**
 * POST /api/purchases
 * Body: { courseId }  (courseId can be string or object with _id)
 *
 * Important fix: sanitize any existing progress for this course on purchase.
 */
router.post('/purchases', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const { courseId, title } = req.body;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // Accept either object with _id or string
    let candidateId = null;
    if (courseId && typeof courseId === 'object') {
      candidateId = courseId._id ?? courseId.id ?? null;
    } else if (courseId) {
      candidateId = String(courseId);
    }

    // If candidateId is sentinel, treat as missing
    if (candidateId && isSentinelString(candidateId)) candidateId = null;

    // If no candidateId and no meaningful title -> reject
    if (!candidateId && !isMeaningfulTitle(title)) {
      return res.status(400).json({ message: 'Invalid purchase: missing courseId or meaningful title' });
    }

    // If course id provided, validate exists
    let resolvedCourse = null;
    if (candidateId) {
      if (!mongoose.Types.ObjectId.isValid(String(candidateId))) {
        return res.status(400).json({ message: 'Invalid courseId format' });
      }
      resolvedCourse = await Course.findById(candidateId).lean();
      if (!resolvedCourse) {
        return res.status(404).json({ message: 'Course not found' });
      }
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // check for existing active purchase (only if we have course id)
    if (resolvedCourse) {
      const already = (user.purchasedCourses || []).some(pc => {
        const pcCid = (pc.courseId && pc.courseId._id) ? String(pc.courseId._id) : (pc.courseId ? String(pc.courseId) : null);
        return pcCid === String(resolvedCourse._id) && (pc.status || 'active') === 'active';
      });
      if (already) return res.status(400).json({ message: 'Course already purchased' });
    }

    // --- NEW: sanitize/reset any existing progress for this course to avoid false "completed" ---
    try {
      if (resolvedCourse && Array.isArray(user.progress)) {
        const normCid = String(resolvedCourse._id);
        let changed = false;
        user.progress = user.progress.map(p => {
          try {
            const pid = (p && p.courseId && p.courseId._id) ? String(p.courseId._id) : (p && p.courseId ? String(p.courseId) : null);
            if (pid === normCid) {
              // Reset this progress entry to a fresh state instead of leaving legacy completion flags
              changed = true;
              return {
                courseId: pid,
                percent: 0,
                hoursLearned: 0,
                completedLessons: [],
                quizPassed: false
              };
            }
            return p;
          } catch (e) {
            return p;
          }
        });
        if (changed) {
          // ensure changes are persisted (we'll save the user later)
        }
      }
    } catch (e) {
      // non-fatal: continue purchase even if sanitization fails for weird data shapes
      console.warn('Warning: failed to sanitize existing progress for purchased course', e);
    }

    const purchaseEntry = {
      courseId: resolvedCourse ? new mongoose.Types.ObjectId(resolvedCourse._id) : undefined,
      title: resolvedCourse ? resolvedCourse.title : (isMeaningfulTitle(title) ? title : undefined),
      price: resolvedCourse ? (resolvedCourse.priceNumber || resolvedCourse.price || 0) : (req.body.price || 0),
      purchasedAt: new Date(),
      status: 'active'
    };

    user.purchasedCourses = user.purchasedCourses || [];
    user.purchasedCourses.push(purchaseEntry);

    // Save user (includes sanitized progress if we reset it above)
    await user.save();

    return res.status(201).json({ success: true, message: 'Purchased', purchase: user.purchasedCourses[user.purchasedCourses.length - 1] });
  } catch (err) {
    console.error('POST /api/purchases error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * DELETE /api/purchases/:id
 * Accepts either purchase _id or courseId as param
 */
router.delete('/purchases/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const idParam = req.params.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!idParam) return res.status(400).json({ message: 'Missing id' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const before = (user.purchasedCourses || []).length;
    user.purchasedCourses = (user.purchasedCourses || []).filter(pc => {
      const purchaseId = pc._id ? String(pc._id) : null;
      const cid = (pc.courseId && pc.courseId._id) ? String(pc.courseId._id) : (pc.courseId ? String(pc.courseId) : null);

      // match either purchase id or course id (defensive)
      if (purchaseId && purchaseId === String(idParam)) return false;
      if (cid && cid === String(idParam)) return false;
      return true;
    });

    const after = (user.purchasedCourses || []).length;
    if (after === before) return res.status(404).json({ message: 'Purchase not found' });

    await user.save();
    return res.json({ success: true, message: 'Purchase cancelled' });
  } catch (err) {
    console.error('DELETE /api/purchases error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
