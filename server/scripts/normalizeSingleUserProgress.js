// scripts/normalizeSingleUserProgress.js
// Usage: node scripts/normalizeSingleUserProgress.js <USER_ID>

const mongoose = require('mongoose');
const path = require('path');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/upwise';
const uid = process.argv[2];

if (!uid) {
  console.error('Usage: node scripts/normalizeSingleUserProgress.js <USER_ID>');
  process.exit(2);
}

const User = require(path.join(__dirname, '..', 'server', 'models', 'User'));

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
  } catch (e) {}
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
      const key = dt.toISOString().slice(0, 10);
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
  } catch (e) { return 0; }
}

function mergeAndNormalize(entries = []) {
  const map = {};
  entries.forEach(e => {
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

    if (!map[key]) map[key] = normalized;
    else {
      const cur = map[key];
      cur.percent = Math.max(cur.percent || 0, normalized.percent || 0);
      cur.hoursLearned = Math.max(cur.hoursLearned || 0, normalized.hoursLearned || 0);
      const set = new Set([...(cur.completedLessons || []), ...(normalized.completedLessons || [])]);
      cur.completedLessons = Array.from(set);
      cur.quizPassed = cur.quizPassed || normalized.quizPassed;
      if (!cur.completedAt && normalized.completedAt) cur.completedAt = normalized.completedAt;
      else if (cur.completedAt && normalized.completedAt) {
        const a = new Date(cur.completedAt);
        const b = new Date(normalized.completedAt);
        if (!isNaN(b.getTime()) && b < a) cur.completedAt = normalized.completedAt;
      }
      if (!cur.lastSeenAt && normalized.lastSeenAt) cur.lastSeenAt = normalized.lastSeenAt;
      else if (cur.lastSeenAt && normalized.lastSeenAt) {
        const a = new Date(cur.lastSeenAt);
        const b = new Date(normalized.lastSeenAt);
        if (!isNaN(b.getTime()) && b > a) cur.lastSeenAt = normalized.lastSeenAt;
      }
    }
  });

  return Object.keys(map).map(k => {
    const o = map[k];
    o.courseId = k;
    o.percent = Number(o.percent || 0);
    o.hoursLearned = Number(o.hoursLearned || 0);
    return o;
  });
}

async function run() {
  console.log('Connecting to', MONGO);
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });

  const user = await User.findById(uid).lean();
  if (!user) {
    console.error('User not found:', uid);
    await mongoose.disconnect();
    process.exit(1);
  }

  const origProgress = Array.isArray(user.progress) ? user.progress : [];
  const origHours = origProgress.reduce((s, e) => s + Number(e?.hoursLearned || 0), 0);

  console.log(`User ${uid} original progress entries: ${origProgress.length} totalHours=${origHours}`);

  const newProgress = mergeAndNormalize(origProgress);
  const newHours = newProgress.reduce((s, e) => s + Number(e?.hoursLearned || 0), 0);

  const newStreak = recomputeStreakFromProgress(newProgress);

  console.log(`Normalized progress entries: ${newProgress.length} totalHours=${newHours} newStreak=${newStreak}`);

  // Write back
  const updated = await User.findByIdAndUpdate(uid, { $set: { progress: newProgress, streakDays: newStreak } }, { new: true }).lean();
  if (!updated) {
    console.error('Failed to update user.');
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log('Update successful. New progress length:', (updated.progress || []).length, 'streakDays:', updated.streakDays);
  await mongoose.disconnect();
  console.log('Done.');
  process.exit(0);
}

run().catch(err => { console.error('Error:', err); process.exit(1); });
