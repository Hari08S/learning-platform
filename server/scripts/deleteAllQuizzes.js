// deleteAllQuizzes.js
require('dotenv').config();
const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upwise';

async function run() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    console.log('Connected to', MONGO_URI);
    if (String(process.env.CONFIRM) !== 'YES') {
      console.error('This script will DELETE ALL documents from quizzes collection. To run, set CONFIRM=YES in env.');
      process.exit(1);
    }
    const res = await Quiz.deleteMany({});
    console.log('Deleted quizzes count:', res.deletedCount);
  } catch (err) {
    console.error('Error', err);
  } finally {
    await mongoose.disconnect();
  }
}

run().catch(e => { console.error(e); process.exit(1); });
