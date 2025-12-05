// scripts/normalizeProgress.js
// Run: node scripts/normalizeProgress.js
// WARNING: backup your DB before running.

const mongoose = require('mongoose');
const path = require('path');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/upwise';
const User = require(path.join(__dirname, '..', 'server', 'models', 'User'));
const Course = require(path.join(__dirname, '..', 'server', 'models', 'Course'));

function toNormalizedKey(val) {
  if (val === undefined || val === null) return '';
  try {
    // If object with _id or id
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

function recomputeStreakFromProgress(progressList = []) {
  try {
    const dateSet = new Set();
    (progressList || []).forEach(p => {
      const d = p.lastSeenAt || p.completedAt || null;
      if (!d) return;
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return;
      const key = dt.toISOString().slice(0, 10); // YYYY-MM-DD
      dateSet.add(key);
    });
    if (dateSet.size === 0) return 0;
    let streak = 0;
    const today = new Date();
    for (let i = 0; ; i++) {
      const dd = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
      dd.setUTCDate(dd.getUTCDate() - i);
      const key = dd.toISOString().slice(0, 10);
      if (dateSet.has(key)) streak++;
      else break;
    }
    return streak;
  } catch (e) {
    return 0;
  }
}

async function mergeAndNormalizeProgressEntries(entries = []) {
  // entries: array of progress entries from user.progress
  const map = {};
  (entries || []).forEach(e => {
    const key = toNormalizedKey(e.courseId);
    if (!key) return;
    const normalized = {
      courseId: key,
      percent: Number(e.percent || 0),
      hoursLearned: Number(e.hoursLearned || 0),
      lastSeenAt: e.lastSeenAt ? new Date(e.lastSeenAt).toISOString() : null,
      completedAt: e.completedAt ? new Date(e.completedAt).toISOString() : null,
      completedLessons: Array.isArray(e.completedLessons) ? e.completedLessons.map(String) : [],
      quizPassed: !!e.quizPassed
    };

    if (!map[key]) {
      map[key] = normalized;
    } else {
      const cur = map[key];
      // percent: take max
      cur.percent = Math.max(cur.percent || 0, normalized.percent || 0);
      // hours: take max to avoid duplicated addition
      cur.hoursLearned = Math.max(cur.hoursLearned || 0, normalized.hoursLearned || 0);
      // completedLessons: union
      const set = new Set([...(cur.completedLessons || []), ...(normalized.completedLessons || [])]);
      cur.completedLessons = Array.from(set);
      // quizPassed: OR
      cur.quizPassed = cur.quizPassed || normalized.quizPassed;
      // completedAt: pick earliest non-null (prefer the earlier completedAt)
      if (!cur.completedAt && normalized.completedAt) cur.completedAt = normalized.completedAt;
      else if (cur.completedAt && normalized.completedAt) {
        try {
          const a = new Date(cur.completedAt);
          const b = new Date(normalized.completedAt);
          if (!isNaN(b.getTime()) && b < a) cur.completedAt = normalized.completedAt;
        } catch (e) {}
      }
      // lastSeenAt: keep the latest
      if (!cur.lastSeenAt && normalized.lastSeenAt) cur.lastSeenAt = normalized.lastSeenAt;
      else if (cur.lastSeenAt && normalized.lastSeenAt) {
        try {
          const a = new Date(cur.lastSeenAt);
          const b = new Date(normalized.lastSeenAt);
          if (!isNaN(b.getTime()) && b > a) cur.lastSeenAt = normalized.lastSeenAt;
        } catch (e) {}
      }
    }
  });

  // map -> list
  const out = Object.keys(map).map(k => {
    const o = map[k];
    o.percent = Number(o.percent || 0);
    o.hoursLearned = Number(o.hoursLearned || 0);
    // ensure courseId stored as string key
    o.courseId = k;
    return o;
  });

  return out;
}

async function run() {
  console.log('Connecting to', MONGO);
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });

  // Option A: normalize all users (safe but possibly slow)
  const cursor = User.find().cursor();
  let processed = 0;
  let updatedCount = 0;

  for (let user = await cursor.next(); user != null; user = await cursor.next()) {
    processed++;
    const origProgress = Array.isArray(user.progress) ? user.progress : [];
    const newProgress = await mergeAndNormalizeProgressEntries(origProgress);

    // compute summary to compare
    const origTotalHours = (origProgress || []).reduce((s, e) => s + Number(e?.hoursLearned || 0), 0);
    const newTotalHours = (newProgress || []).reduce((s, e) => s + Number(e?.hoursLearned || 0), 0);

    // dedupe count
    const changed = (
      newProgress.length !== origProgress.length ||
      Math.abs(newTotalHours - origTotalHours) > 1e-6 ||
      (user.streakDays || 0) !== recomputeStreakFromProgress(newProgress)
    );

    if (changed) {
      const newStreak = recomputeStreakFromProgress(newProgress);
      try {
        await User.updateOne({ _id: user._id }, { $set: { progress: newProgress, streakDays: newStreak } });
        updatedCount++;
        console.log(`Updated user ${String(user._id)}: progress ${origProgress.length} -> ${newProgress.length}, hours ${origTotalHours} -> ${newTotalHours}, streak ${user.streakDays || 0} -> ${newStreak}`);
      } catch (e) {
        console.error(`Failed to update user ${String(user._id)}:`, e);
      }
    }

    if (processed % 50 === 0) {
      console.log(`Processed ${processed} users (updated ${updatedCount})...`);
    }
  }

  console.log(`Done. Processed ${processed} users. Updated ${updatedCount} users.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
