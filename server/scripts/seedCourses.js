// server/scripts/seedCourses.js
// Run from the server folder: node scripts/seedCourses.js
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const connectDB = require('../config/db');
const Course = require('../models/Course');

async function tryRequire(p) {
  try {
    if (fs.existsSync(p)) {
      const mod = require(p);
      return mod && mod.default ? mod.default : mod;
    }
  } catch (err) {
    // ignore
  }
  return null;
}

async function loadCoursesData() {
  // Added common possible locations including your workspace my-app folder
  const possible = [
    path.resolve(__dirname, '../../my-app/src/data/coursesData.js'),
    path.resolve(__dirname, '../../src/data/coursesData.js'),
    path.resolve(__dirname, '../data/coursesData.js'),
    path.resolve(__dirname, './data/coursesData.js'),
    path.resolve(__dirname, '../../src/data/coursesData.cjs')
  ];

  for (const p of possible) {
    const data = await tryRequire(p);
    if (data) {
      console.log('Loaded courses data from', p);
      return data;
    }
  }

  console.error('Could not find src/data/coursesData.js. Ensure that file exists at one of:', possible);
  process.exit(1);
}

async function seed() {
  // Use MONGO_URI if set; fallback to mongodb://localhost:27017/
  const rawUri = process.env.MONGO_URI || 'mongodb://localhost:27017/';
  const uri = rawUri.endsWith('/') ? `${rawUri}upwise` : rawUri;

  try {
    console.log('Connecting to MongoDB at', uri);
    await connectDB(uri);
    console.log('Connected to Mongo');

    const coursesData = await loadCoursesData();

    // Remove existing courses
    await Course.deleteMany({});
    console.log('Cleared existing courses.');

    // Prepare docs: ensure we DON'T set _id to numeric id
    const toInsert = (coursesData || []).map((c) => {
      // keep original numeric id in legacyId, but remove id key so mongoose generates ObjectId
      const { id: legacyId, ...rest } = c;

      // compute numeric price (if price is string)
      const priceNumber = typeof rest.price === 'number'
        ? rest.price
        : (('' + (rest.price || '')).match(/(\d+(\.\d+)?)/) || [0])[0] || 0;

      return {
        ...rest,
        legacyId: legacyId !== undefined ? legacyId : null,
        priceNumber,
        createdAt: rest.createdAt ? new Date(rest.createdAt) : new Date()
      };
    });

    if (toInsert.length === 0) {
      console.warn('No courses found in data file (nothing to insert).');
      process.exit(0);
    }

    const inserted = await Course.insertMany(toInsert);
    console.log('Inserted', inserted.length, 'courses. Example id:', inserted[0]._id.toString());
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed', err);
    process.exit(1);
  }
}

seed();
