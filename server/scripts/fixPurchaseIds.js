/**
 * Fix purchases & progress courseId mismatches
 *
 * Usage:
 *   node server/scripts/fixPurchaseIds.js            # dry-run (no writes)
 *   APPLY=1 node server/scripts/fixPurchaseIds.js    # perform updates
 *
 * This script will:
 *  - iterate all users
 *  - for each purchasedCourses entry, try to resolve purchase.courseId to an existing Course._id
 *  - for each progress entry, try to resolve progress.courseId similarly
 *  - if a mapping is found, it will update the user document when APPLY=1
 *
 * Note: keep server stopped / or ensure code compatibility with your Mongoose config.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

const APPLY = !!(process.env.APPLY && String(process.env.APPLY) !== '0');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upwise';

async function main() {
  console.log('Connecting to DB:', MONGO_URI);
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  // load models (adjust paths if needed)
  const User = require('../models/User');
  const Course = require('../models/Course');

  // Build maps for quick lookup from Course collection:
  // - by _id string
  // - by legacyId (string/number)
  // - by id (numeric id field from coursesData)
  // - by title (fallback) - used only when nothing else
  console.log('Loading all courses to build lookup maps...');
  const courses = await Course.find({}).lean();

  const byObjectId = new Map();
  const byLegacyId = new Map();
  const byNumericId = new Map();
  const byTitle = new Map();

  courses.forEach(c => {
    const keyId = String(c._id);
    byObjectId.set(keyId, c);

    if (c.legacyId !== undefined && c.legacyId !== null) {
      byLegacyId.set(String(c.legacyId), c);
      // also numeric key if numeric
      if (!Number.isNaN(Number(c.legacyId))) {
        byNumericId.set(Number(c.legacyId), c);
      }
    }
    if (c.id !== undefined && c.id !== null) {
      const n = Number(c.id);
      if (!Number.isNaN(n)) {
        byNumericId.set(n, c);
      }
      byLegacyId.set(String(c.id), c); // string fallback too
    }
    if (c.title) {
      byTitle.set(String(c.title).trim().toLowerCase(), c);
    }
  });

  console.log(`Courses loaded: ${courses.length}`);
  console.log(`Lookups: byObjectId=${byObjectId.size} byLegacyId=${byLegacyId.size} byNumericId=${byNumericId.size} byTitle=${byTitle.size}`);

  // resolver with caching per-run
  const resolvedCache = new Map();

  async function resolveCandidateToCourse(candidate) {
    // normalize candidate into a string/number
    if (candidate === undefined || candidate === null) return null;

    // If it's an object with _id, use that
    if (typeof candidate === 'object') {
      if (candidate._id) candidate = candidate._id;
      else if (candidate.id) candidate = candidate.id;
    }

    // string or number
    // cache key as String
    const key = String(candidate);

    if (resolvedCache.has(key)) return resolvedCache.get(key);

    // 1) if candidate looks like ObjectId, try direct match
    if (mongoose.Types.ObjectId.isValid(key)) {
      const found = byObjectId.get(key);
      if (found) {
        resolvedCache.set(key, found);
        return found;
      }
    }

    // 2) try by legacyId string
    if (byLegacyId.has(key)) {
      const found = byLegacyId.get(key);
      resolvedCache.set(key, found);
      return found;
    }

    // 3) try numeric id match
    const num = Number(key);
    if (!Number.isNaN(num) && byNumericId.has(num)) {
      const found = byNumericId.get(num);
      resolvedCache.set(key, found);
      return found;
    }

    // 4) try title fallback (case-insensitive)
    const tkey = String(key).trim().toLowerCase();
    if (byTitle.has(tkey)) {
      const found = byTitle.get(tkey);
      resolvedCache.set(key, found);
      return found;
    }

    // 5) As a last attempt, try db lookup by legacyId or id if not present in loaded maps
    try {
      // look for string or number in legacyId or id fields
      const doc = await Course.findOne({ $or: [{ legacyId: key }, { legacyId: Number(key) }, { id: key }, { id: Number(key) }] }).lean();
      if (doc) {
        // update maps
        byObjectId.set(String(doc._id), doc);
        if (doc.legacyId !== undefined && doc.legacyId !== null) byLegacyId.set(String(doc.legacyId), doc);
        if (doc.id !== undefined && doc.id !== null && !Number.isNaN(Number(doc.id))) byNumericId.set(Number(doc.id), doc);
        if (doc.title) byTitle.set(String(doc.title).trim().toLowerCase(), doc);
        resolvedCache.set(key, doc);
        return doc;
      }
    } catch (e) {
      // ignore
    }

    resolvedCache.set(key, null);
    return null;
  }

  // iterate users in batches to avoid memory overload
  console.log('Scanning users for purchases and progress to repair...');
  const cursor = User.find({}).cursor();
  let totalUsers = 0;
  let usersWithProblems = 0;
  let changesPlanned = 0;
  let changesApplied = 0;
  const unresolvedCandidates = new Map();

  for (let user = await cursor.next(); user != null; user = await cursor.next()) {
    totalUsers++;
    const userId = String(user._id);
    const purchased = Array.isArray(user.purchasedCourses) ? user.purchasedCourses : [];
    const progress = Array.isArray(user.progress) ? user.progress : [];

    let userNeedsUpdate = false;
    const purchasedUpdates = [];
    const progressUpdates = [];

    // check purchases
    for (let i = 0; i < purchased.length; i++) {
      const pc = purchased[i];
      if (!pc || !pc.courseId) continue;

      // normalize candidate
      const candidate = (pc.courseId && typeof pc.courseId === 'object') ? (pc.courseId._id ?? pc.courseId.id ?? pc.courseId) : pc.courseId;

      const courseMatch = await resolveCandidateToCourse(candidate);

      if (!courseMatch) {
        // cannot resolve - log for later
        const key = String(candidate);
        const arr = unresolvedCandidates.get(key) || [];
        arr.push({ userId, kind: 'purchase', purchaseRaw: pc });
        unresolvedCandidates.set(key, arr);
        continue;
      }

      const resolvedIdStr = String(courseMatch._id);
      const existingCourseIdStr = (pc.courseId && pc.courseId._id) ? String(pc.courseId._id) : String(pc.courseId);

      if (existingCourseIdStr !== resolvedIdStr) {
        // plan update
        purchasedUpdates.push({ index: i, old: existingCourseIdStr, new: resolvedIdStr, courseTitle: courseMatch.title });
        userNeedsUpdate = true;
      }
    }

    // check progress entries
    for (let j = 0; j < progress.length; j++) {
      const p = progress[j];
      if (!p || !p.courseId) continue;
      const candidate = (p.courseId && typeof p.courseId === 'object') ? (p.courseId._id ?? p.courseId.id ?? p.courseId) : p.courseId;
      const courseMatch = await resolveCandidateToCourse(candidate);
      if (!courseMatch) {
        const key = String(candidate);
        const arr = unresolvedCandidates.get(key) || [];
        arr.push({ userId, kind: 'progress', progressRaw: p });
        unresolvedCandidates.set(key, arr);
        continue;
      }
      const resolvedIdStr = String(courseMatch._id);
      const existingProgIdStr = (p.courseId && p.courseId._id) ? String(p.courseId._id) : String(p.courseId);
      if (existingProgIdStr !== resolvedIdStr) {
        progressUpdates.push({ index: j, old: existingProgIdStr, new: resolvedIdStr, courseTitle: courseMatch.title });
        userNeedsUpdate = true;
      }
    }

    if (userNeedsUpdate) {
      usersWithProblems++;
      changesPlanned += purchasedUpdates.length + progressUpdates.length;

      console.log(`\nUser ${userId} -> planned updates: purchases=${purchasedUpdates.length} progress=${progressUpdates.length}`);

      purchasedUpdates.forEach(u => {
        console.log(`  purchase[${u.index}] : ${u.old} -> ${u.new} (${u.courseTitle})`);
      });
      progressUpdates.forEach(u => {
        console.log(`  progress[${u.index}] : ${u.old} -> ${u.new} (${u.courseTitle})`);
      });

      if (APPLY) {
        // apply updates to the Mongoose user document and save
        try {
          // reload user as mongoose document to save (not lean)
          const userDoc = await User.findById(userId);
          if (!userDoc) {
            console.warn(`  [WARN] could not reload user ${userId} for write`);
          } else {
            // purchases
            purchasedUpdates.forEach(u => {
              const entry = userDoc.purchasedCourses[u.index];
              if (entry) {
                entry.courseId = mongoose.Types.ObjectId.isValid(u.new) ? new mongoose.Types.ObjectId(u.new) : u.new;
              }
            });
            // progress
            progressUpdates.forEach(u => {
              const entry = userDoc.progress[u.index];
              if (entry) {
                entry.courseId = mongoose.Types.ObjectId.isValid(u.new) ? new mongoose.Types.ObjectId(u.new) : u.new;
              }
            });

            await userDoc.save();
            changesApplied += purchasedUpdates.length + progressUpdates.length;
            console.log(`  [APPLIED] saved user ${userId}`);
          }
        } catch (e) {
          console.error(`  [ERROR] saving user ${userId}`, e);
        }
      }
    }
  } // end user cursor

  console.log('\n--- Summary ---');
  console.log(`Total users scanned: ${totalUsers}`);
  console.log(`Users needing updates: ${usersWithProblems}`);
  console.log(`Planned changes: ${changesPlanned}`);
  console.log(`Applied changes: ${changesApplied} (APPLY=${APPLY ? 'yes' : 'no'})`);
  console.log(`Unresolved candidates (count): ${unresolvedCandidates.size}`);

  if (unresolvedCandidates.size > 0) {
    console.log('\nSample unresolved keys (candidate -> sample occurrences):');
    let i = 0;
    for (const [k, arr] of unresolvedCandidates.entries()) {
      if (i++ >= 30) break;
      console.log(`  "${k}" -> ${arr.length} occurrence(s) e.g.`, arr.slice(0,3));
    }
  }

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});
