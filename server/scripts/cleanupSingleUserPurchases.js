// scripts/cleanupSingleUserPurchases.js
// Usage: node scripts/cleanupSingleUserPurchases.js <USER_ID>
// Example: node scripts/cleanupSingleUserPurchases.js 69299626bb9a66e4a3265378

require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

const User = require(path.join(__dirname, '..', 'server', 'models', 'User'));

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
  const uidArg = process.argv[2];
  if (!uidArg) {
    console.error('ERROR: missing user id argument. Usage: node scripts/cleanupSingleUserPurchases.js <USER_ID>');
    process.exit(1);
  }

  const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/upwise';
  console.log('Connecting to', MONGO);
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    const uid = mongoose.Types.ObjectId.isValid(uidArg) ? mongoose.Types.ObjectId(uidArg) : uidArg;
    const user = await User.findById(uid).exec();

    if (!user) {
      console.error('User not found for id:', uidArg);
      await mongoose.disconnect();
      process.exit(1);
    }

    const before = Array.isArray(user.purchasedCourses) ? user.purchasedCourses.length : 0;
    console.log(`User ${user._id} has ${before} purchasedCourses before cleanup.`);

    const kept = [];

    for (const pc of (user.purchasedCourses || [])) {
      if (!pc) continue;

      // Embedded course object with meaningful title => keep
      if (pc.courseId && typeof pc.courseId === 'object' && (pc.courseId._id || pc.courseId.title)) {
        const title = pc.courseId.title || pc.title || '';
        if (isMeaningfulTitle(title)) {
          kept.push(pc);
        } else {
          console.log(`Dropping embedded purchase (non-meaningful title). purchase._id=${pc._id || 'n/a'}`);
        }
        continue;
      }

      // courseId present and not sentinel => keep
      const cid = (pc.courseId && (pc.courseId._id ? pc.courseId._id : pc.courseId)) || pc.courseId;
      if (cid && !isSentinelString(cid)) {
        kept.push(pc);
        continue;
      }

      // meaningful purchase.title => keep
      if (isMeaningfulTitle(pc.title)) {
        kept.push(pc);
        continue;
      }

      // otherwise drop
      console.log(`Dropping purchase with no courseId and no meaningful title. purchase._id=${pc._id || 'n/a'}`);
    }

    const removed = before - kept.length;
    if (removed > 0) {
      user.purchasedCourses = kept;
      await user.save();
      console.log(`Saved user ${user._id}. Removed ${removed} purchases. Remaining: ${kept.length}`);
    } else {
      console.log('No purchases removed; user purchases already appear clean.');
    }

    // show remaining purchases summary
    if (Array.isArray(user.purchasedCourses) && user.purchasedCourses.length > 0) {
      console.log('Remaining purchases (summary):');
      user.purchasedCourses.forEach((p, idx) => {
        const cid = p.courseId && p.courseId._id ? String(p.courseId._id) : (p.courseId ? String(p.courseId) : '');
        console.log(`${idx+1}) purchaseId:${p._id || 'n/a'} courseId:${cid || 'n/a'} title:${p.title || (p.courseId && p.courseId.title) || 'n/a'}`);
      });
    } else {
      console.log('User now has 0 purchases.');
    }

  } catch (err) {
    console.error('Cleanup error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
