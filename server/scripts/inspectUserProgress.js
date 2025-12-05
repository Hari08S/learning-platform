// scripts/inspectUserProgress.js
// Usage: node scripts/inspectUserProgress.js <USER_ID>

const mongoose = require('mongoose');
const path = require('path');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/upwise';
const uid = process.argv[2];

if (!uid) {
  console.error('Usage: node scripts/inspectUserProgress.js <USER_ID>');
  process.exit(2);
}

const User = require(path.join(__dirname, '..', 'server', 'models', 'User'));
const QuizResult = require(path.join(__dirname, '..', 'server', 'models', 'QuizResult'));

function toStr(v) {
  try { return String(v); } catch (e) { return JSON.stringify(v); }
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

  console.log('User:', { _id: String(user._id), name: user.name, email: user.email, streakDays: user.streakDays || 0 });
  const progress = Array.isArray(user.progress) ? user.progress : [];
  console.log('progress.length =', progress.length);

  let totalHours = 0;
  const seen = {};
  progress.forEach((p, i) => {
    const cid = toStr(p.courseId);
    const percent = Number(p.percent || 0);
    const hours = Number(p.hoursLearned || 0);
    totalHours += hours;
    if (!seen[cid]) seen[cid] = [];
    seen[cid].push({ index: i, percent, hours, quizPassed: !!p.quizPassed, completedAt: p.completedAt, lastSeenAt: p.lastSeenAt });
  });

  console.log('Total hours sum across entries:', totalHours);
  console.log('Unique courseKeys found:', Object.keys(seen).length);

  Object.keys(seen).forEach((k) => {
    const arr = seen[k];
    if (arr.length > 1) {
      console.warn(`DUPLICATES for courseId=${k} -> ${arr.length} entries:`);
    }
    arr.forEach(a => {
      console.log(`  idx=${a.index} percent=${a.percent} hours=${a.hours} quizPassed=${a.quizPassed} lastSeen=${a.lastSeenAt} completedAt=${a.completedAt}`);
    });
  });

  const results = await QuizResult.find({ userId: uid }).lean();
  console.log('quizResults count:', results.length);
  results.forEach((r, i) => {
    console.log(`  [${i}] courseId=${toStr(r.courseId)} percentage=${r.percentage} passed=${r.passed} timeTaken=${r.timeTakenSeconds}`);
  });

  await mongoose.disconnect();
  console.log('Done.');
  process.exit(0);
}

run().catch(err => { console.error('Error:', err); process.exit(1); });
