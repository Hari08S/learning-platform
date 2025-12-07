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
 * GET /api/me/purchases
 * Returns all purchases (active + cancelled) for the logged-in user.
 * If there are no clean purchases, falls back to progress-based pseudo purchases.
 */
router.get('/me/purchases', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId)
      .populate('purchasedCourses.courseId', 'title author image img price priceNumber')
      .lean();

    if (!user) return res.status(404).json({ message: 'User not found' });

    const goodPurchases = [];
    let badCount = 0;

    (user.purchasedCourses || []).forEach(pc => {
      const course =
        pc.courseId && typeof pc.courseId === 'object' && pc.courseId._id
          ? pc.courseId
          : null;

      const rawCourseId = course ? course._id : pc.courseId;
      const cid = rawCourseId ? String(rawCourseId) : null;

      let title = pc.title;
      if (!isMeaningfulTitle(title) && course && isMeaningfulTitle(course.title)) {
        title = course.title;
      }

      if (!cid && !isMeaningfulTitle(title)) {
        badCount++;
        return;
      }

      let price = pc.price;
      if (price == null && course) {
        price = course.priceNumber ?? course.price ?? null;
      }

      let img = pc.img;
      if (!img && course) {
        img = course.image || course.img || null;
      }

      goodPurchases.push({
        purchaseId: pc._id ? String(pc._id) : null,
        courseId: cid,
        title: title || '',
        author: (course && course.author) || pc.author || '',
        img,
        price,
        status: pc.status || 'active',
        purchasedAt: pc.purchasedAt || pc.createdAt || null,
        cancelledAt: pc.cancelledAt || null
      });
    });

    // 🚫 Removed noisy logs — nothing will print
    // if (badCount) {
    //   console.log(`[purchases] skipped ${badCount} malformed entries`);
    // }

    if (goodPurchases.length > 0) {
      return res.json({ purchases: goodPurchases });
    }

    // 🔁 Fallback: derive purchases from progress
    if (Array.isArray(user.progress) && user.progress.length > 0) {
      const ids = new Set();

      user.progress.forEach(p => {
        const cid =
          p && p.courseId && p.courseId._id
            ? String(p.courseId._id)
            : p && p.courseId
            ? String(p.courseId)
            : null;
        if (cid) ids.add(cid);
      });

      const courseIds = Array.from(ids);
      if (courseIds.length === 0) {
        return res.json({ purchases: [] });
      }

      const courses = await Course.find({ _id: { $in: courseIds } }).lean();
      const courseMap = new Map(courses.map(c => [String(c._id), c]));

      const fallbackPurchases = courseIds.map(cid => {
        const course = courseMap.get(cid);
        return {
          purchaseId: `progress-${cid}`,
          courseId: cid,
          title: course?.title || 'Course',
          author: course?.author || '',
          img: course?.image || course?.img || null,
          price:
            course?.priceNumber ?? course?.price ?? null,
          status: 'active',
          purchasedAt: null,
          cancelledAt: null
        };
      });

      return res.json({ purchases: fallbackPurchases });
    }

    return res.json({ purchases: [] });
  } catch (err) {
    console.error('GET /api/me/purchases error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/purchases
 */
router.post('/purchases', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const { courseId, title } = req.body;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    let candidateId = null;
    if (courseId && typeof courseId === 'object') {
      candidateId = courseId._id ?? courseId.id ?? null;
    } else if (courseId) {
      candidateId = String(courseId);
    }

    if (candidateId && isSentinelString(candidateId)) candidateId = null;

    if (!candidateId && !isMeaningfulTitle(title)) {
      return res
        .status(400)
        .json({ message: 'Invalid purchase: missing courseId or meaningful title' });
    }

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

    if (resolvedCourse) {
      const already = (user.purchasedCourses || []).some(pc => {
        const pcCid =
          pc.courseId && pc.courseId._id
            ? String(pc.courseId._id)
            : pc.courseId
            ? String(pc.courseId)
            : null;
        return pcCid === String(resolvedCourse._id) && (pc.status || 'active') === 'active';
      });
      if (already) return res.status(400).json({ message: 'Course already purchased' });
    }

    try {
      if (resolvedCourse && Array.isArray(user.progress)) {
        const normCid = String(resolvedCourse._id);
        user.progress = user.progress.map(p => {
          try {
            const pid =
              p && p.courseId && p.courseId._id
                ? String(p.courseId._id)
                : p && p.courseId
                ? String(p.courseId)
                : null;
            if (pid === normCid) {
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
      }
    } catch (e) {
      console.warn(
        'Warning: failed to sanitize existing progress for purchased course',
        e
      );
    }

    const purchaseEntry = {
      courseId: resolvedCourse ? new mongoose.Types.ObjectId(resolvedCourse._id) : undefined,
      title: resolvedCourse
        ? resolvedCourse.title
        : isMeaningfulTitle(title)
        ? title
        : undefined,
      price: resolvedCourse
        ? resolvedCourse.priceNumber || resolvedCourse.price || 0
        : req.body.price || 0,
      purchasedAt: new Date(),
      status: 'active'
    };

    user.purchasedCourses = user.purchasedCourses || [];
    user.purchasedCourses.push(purchaseEntry);

    await user.save();

    const created = user.purchasedCourses[user.purchasedCourses.length - 1];

    return res
      .status(201)
      .json({ success: true, message: 'Purchased', purchase: created });
  } catch (err) {
    console.error('POST /api/purchases error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * DELETE /api/purchases/:id
 */
router.delete('/purchases/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const idParam = req.params.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!idParam) return res.status(400).json({ message: 'Missing id' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let found = false;

    (user.purchasedCourses || []).forEach(pc => {
      const purchaseId = pc._id ? String(pc._id) : null;
      const cid =
        pc.courseId && pc.courseId._id
          ? String(pc.courseId._id)
          : pc.courseId
          ? String(pc.courseId)
          : null;

      if (
        (purchaseId && purchaseId === String(idParam)) ||
        (cid && cid === String(idParam))
      ) {
        found = true;
        pc.status = 'cancelled';
        pc.cancelledAt = new Date();
      }
    });

    if (!found) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    await user.save();
    return res.json({ success: true, message: 'Purchase cancelled' });
  } catch (err) {
    console.error('DELETE /api/purchases error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/purchases/:id/restore
 */
router.post('/purchases/:id/restore', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const idParam = req.params.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!idParam) return res.status(400).json({ message: 'Missing id' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let found = false;

    (user.purchasedCourses || []).forEach(pc => {
      const purchaseId = pc._id ? String(pc._id) : null;
      const cid =
        pc.courseId && pc.courseId._id
          ? String(pc.courseId._id)
          : pc.courseId
          ? String(pc.courseId)
          : null;

      if (
        (purchaseId && purchaseId === String(idParam)) ||
        (cid && cid === String(idParam))
      ) {
        found = true;
        pc.status = 'active';
        pc.cancelledAt = null;
      }
    });

    if (!found) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    await user.save();
    return res.json({ success: true, message: 'Purchase restored' });
  } catch (err) {
    console.error('POST /api/purchases/:id/restore error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
