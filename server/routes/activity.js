const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const mongoose = require('mongoose');

/**
 * Helper: normalize a courseId value (which may be populated object, ObjectId string,
 * numeric legacyId, or mixed). Returns an object { key, legacyId, title }
 */
function extractCourseIdentity(raw) {
  if (!raw && raw !== 0) return { key: null, legacyId: null, title: null };
  if (typeof raw === 'object') {
    if (raw._id) return { key: String(raw._id), legacyId: raw.legacyId ?? null, title: raw.title ?? null };
    if (raw.id) return { key: String(raw.id), legacyId: raw.legacyId ?? null, title: raw.title ?? null };
  }
  if (typeof raw === 'string') {
    if (raw.length === 24 && mongoose.Types.ObjectId.isValid(raw)) return { key: raw, legacyId: null, title: null };
    const n = parseInt(raw, 10);
    if (!Number.isNaN(n)) return { key: null, legacyId: n, title: null };
    if (raw === 'undefined') return { key: null, legacyId: null, title: null };
    return { key: raw, legacyId: null, title: null };
  }
  if (typeof raw === 'number') return { key: null, legacyId: raw, title: null };
  return { key: null, legacyId: null, title: null };
}

/**
 * GET /api/me/activity
 */
router.get('/me/activity', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('purchasedCourses.courseId')
      .populate('progress.courseId')
      .lean();

    if (!user) return res.status(404).json({ message: 'User not found' });

    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '30', 10)));
    const since = req.query.since ? new Date(req.query.since) : null;

    const idsToFetch = new Set();
    const legacyIdsToFetch = new Set();
    const prepopulatedTitles = {};

    const addIdentity = (raw) => {
      const id = extractCourseIdentity(raw);
      if (id.title) {
        if (id.key) prepopulatedTitles[id.key] = id.title;
        else if (id.legacyId != null) prepopulatedTitles[`legacy:${id.legacyId}`] = id.title;
      } else if (id.key) {
        if (id.key && id.key !== 'undefined') idsToFetch.add(id.key);
      } else if (id.legacyId != null) legacyIdsToFetch.add(id.legacyId);
    };

    (user.purchasedCourses || []).forEach(pc => { if (pc && pc.courseId) addIdentity(pc.courseId); });
    (user.progress || []).forEach(p => { if (p && p.courseId) addIdentity(p.courseId); });
    (user.certificates || []).forEach(c => { if (c && c.courseId) addIdentity(c.courseId); });

    const courseMap = {};

    // Defensive: only convert to ObjectId using `new` and only include valid ids
    if (idsToFetch.size) {
      const arr = Array.from(idsToFetch).filter(x => mongoose.Types.ObjectId.isValid(String(x)));
      if (arr.length) {
        // IMPORTANT: use `new mongoose.Types.ObjectId(id)` — not mongoose.Types.ObjectId(id)
        const oids = arr.map(id => new mongoose.Types.ObjectId(String(id)));
        const docs = await Course.find({ _id: { $in: oids } }, { title: 1, legacyId: 1 }).lean();
        docs.forEach(d => {
          if (d && d._id) courseMap[String(d._id)] = { title: d.title || null, _id: String(d._id), legacyId: d.legacyId ?? null };
        });
      }
    }

    if (legacyIdsToFetch.size) {
      const arr = Array.from(legacyIdsToFetch).filter(x => typeof x === 'number' || (!Number.isNaN(parseInt(x, 10))));
      if (arr.length) {
        const docs = await Course.find({ legacyId: { $in: arr } }, { title: 1, legacyId: 1 }).lean();
        docs.forEach(d => {
          if (d && d.legacyId != null) courseMap[`legacy:${d.legacyId}`] = { title: d.title || null, _id: d._id ? String(d._id) : null, legacyId: d.legacyId };
        });
      }
    }

    Object.keys(prepopulatedTitles).forEach(k => {
      courseMap[k] = courseMap[k] || {};
      courseMap[k].title = prepopulatedTitles[k];
    });

    function resolveCourse(raw) {
      const id = extractCourseIdentity(raw);
      if (id.title) return { title: id.title, id: id.key || (id.legacyId != null ? `legacy:${id.legacyId}` : null) };
      if (id.key && courseMap[id.key]) return { title: courseMap[id.key].title || null, id: courseMap[id.key]._id || id.key };
      if (id.legacyId != null && courseMap[`legacy:${id.legacyId}`]) return { title: courseMap[`legacy:${id.legacyId}`].title || null, id: courseMap[`legacy:${id.legacyId}`].legacyId || `legacy:${id.legacyId}` };
      return { title: null, id: id.key || (id.legacyId != null ? `legacy:${id.legacyId}` : null) };
    }

    const events = [];

    (user.purchasedCourses || []).forEach(pc => {
      const resolved = resolveCourse(pc.courseId);
      const courseTitle = resolved.title || '';
      let courseIdVal = null;
      if (pc.courseId && typeof pc.courseId === 'object') {
        if (pc.courseId._id) courseIdVal = String(pc.courseId._id);
        else if (pc.courseId.id) courseIdVal = String(pc.courseId.id);
      } else if (pc.courseId) {
        courseIdVal = String(pc.courseId);
      }
      const time = pc.purchasedAt || pc.createdAt || new Date();
      if (since && new Date(time) < since) return;
      events.push({
        id: `purchase_${String(courseIdVal || '')}_${new Date(time).getTime()}`,
        type: 'purchase',
        title: `Purchased: ${courseTitle || 'Course'}`,
        courseId: courseIdVal,
        time: new Date(time),
        meta: { price: pc.price, courseTitle }
      });
    });

    (user.progress || []).forEach(p => {
      const resolved = resolveCourse(p.courseId);
      const courseTitle = resolved.title || '';
      let courseIdVal = null;
      if (p.courseId && typeof p.courseId === 'object') {
        if (p.courseId._id) courseIdVal = String(p.courseId._id);
        else if (p.courseId.id) courseIdVal = String(p.courseId.id);
      } else if (p.courseId) {
        courseIdVal = String(p.courseId);
      }

      if (p.completedAt && p.quizPassed) {
        const time = p.completedAt;
        if (since && new Date(time) < since) return;
        events.push({
          id: `completed_${String(courseIdVal || '')}_${new Date(time).getTime()}`,
          type: 'course_completed',
          title: `Completed: ${courseTitle || 'Course'}`,
          courseId: courseIdVal,
          time: new Date(time),
          meta: { percent: p.percent, courseTitle }
        });
      } else if (p.lastSeenAt && (p.percent && p.percent > 0)) {
        const time = p.lastSeenAt;
        if (since && new Date(time) < since) return;
        events.push({
          id: `progress_${String(courseIdVal || '')}_${new Date(time).getTime()}`,
          type: 'lesson_completed',
          title: `Progress: ${courseTitle || 'Course'}`,
          courseId: courseIdVal,
          time: new Date(time),
          meta: { percent: p.percent, courseTitle }
        });
      }
    });

    (user.certificates || []).forEach(c => {
      const resolved = resolveCourse(c.courseId);
      const courseTitle = c.title || resolved.title || '';
      let courseIdVal = null;
      if (c.courseId && typeof c.courseId === 'object') {
        if (c.courseId._id) courseIdVal = String(c.courseId._id);
        else if (c.courseId.id) courseIdVal = String(c.courseId.id);
      } else if (c.courseId) {
        courseIdVal = String(c.courseId);
      }
      const time = c.issuedOn || new Date();
      if (since && new Date(time) < since) return;
      events.push({
        id: `cert_${String(courseIdVal || '')}_${new Date(time).getTime()}`,
        type: 'certificate_issued',
        title: `Certificate: ${courseTitle}`,
        courseId: courseIdVal,
        time: new Date(time),
        meta: { filename: c.filename, courseTitle }
      });
    });

    const daysSet = new Set();
    (user.progress || []).forEach(p => {
      if (p.lastSeenAt) daysSet.add(new Date(p.lastSeenAt).toISOString().slice(0, 10));
    });
    if (daysSet.size) {
      const time = new Date();
      if (!since || time >= since) {
        events.push({
          id: `streak_${user._id}_${daysSet.size}`,
          type: 'streak',
          title: `Learning streak: ${daysSet.size} day${daysSet.size > 1 ? 's' : ''}`,
          courseId: null,
          time,
          meta: { streakDays: daysSet.size }
        });
      }
    }

    events.sort((a, b) => new Date(b.time) - new Date(a.time));
    const sliced = events.slice(0, limit);
    const out = sliced.map(e => ({ ...e, time: (e.time instanceof Date) ? e.time.toISOString() : new Date(e.time).toISOString() }));

    return res.json({ events: out, count: events.length, returned: out.length });
  } catch (err) {
    console.error('me.activity', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
