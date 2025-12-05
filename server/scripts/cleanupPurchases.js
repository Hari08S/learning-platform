// scripts/cleanupPurchases.js
// Usage: set MONGO_URI in .env then run: node scripts/cleanupPurchases.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../server/models/User');

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

async function main() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/upwise';
  console.log('Connecting to', uri);
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  const cursor = User.find({}).cursor();
  let usersUpdated = 0;
  let purchasesRemovedTotal = 0;

  for (let user = await cursor.next(); user != null; user = await cursor.next()) {
    const orig = Array.isArray(user.purchasedCourses) ? user.purchasedCourses.slice() : [];
    const kept = [];

    for (const pc of orig) {
      // If purchase is falsy skip
      if (!pc) continue;

      // If purchase has embedded course object with title/_id -> keep if meaningful title
      if (pc.courseId && typeof pc.courseId === 'object' && (pc.courseId._id || pc.courseId.title)) {
        const title = pc.courseId.title || pc.title || '';
        if (isMeaningfulTitle(title)) {
          kept.push(pc);
        } else {
          // drop it
        }
        continue;
      }

      // If courseId is present and not sentinel -> keep
      const cid = (pc.courseId && (pc.courseId._id ? pc.courseId._id : pc.courseId)) || pc.courseId;
      if (cid && !isSentinelString(cid)) {
        kept.push(pc);
        continue;
      }

      // If purchase has a meaningful title -> keep
      if (isMeaningfulTitle(pc.title)) {
        kept.push(pc);
        continue;
      }

      // otherwise drop
    }

    const removed = orig.length - kept.length;
    if (removed > 0) {
      user.purchasedCourses = kept;
      try {
        await user.save();
        usersUpdated++;
        purchasesRemovedTotal += removed;
        console.log(`Cleaned user ${user._id}: removed ${removed} purchases (now ${kept.length}).`);
      } catch (e) {
        console.error(`Failed to save user ${user._id}:`, e);
      }
    }
  }

  console.log(`Done. Users updated: ${usersUpdated}. Purchases removed: ${purchasesRemovedTotal}.`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('Cleanup error:', err);
  process.exit(1);
});
