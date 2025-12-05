// server/scripts/seedQuiz.js
const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const Course = require('../models/Course');

const DB = process.env.MONGO_URI || 'mongodb://localhost:27017/yourdb';

async function seed() {
  await mongoose.connect(DB);
  const courses = await Course.find({});
  for (const course of courses) {
    const exists = await Quiz.findOne({ courseId: course._id });
    if (exists) {
      console.log('Quiz exists for', course._id.toString());
      continue;
    }
    const q = new Quiz({
      courseId: course._id,
      title: `${course.title} — Final Quiz`,
      estimatedMins: 10,
      passingPercentage: 50,
      questions: [
        {
          text: 'What is React primarily used for?',
          options: [{ id: 'a', text: 'Building UIs' }, { id: 'b', text: 'Database' }, { id: 'c', text: 'OS' }],
          correctOptionId: 'a'
        },
        {
          text: 'JSX is a syntax extension for which language?',
          options: [{ id: 'a', text: 'TypeScript' }, { id: 'b', text: 'JavaScript' }],
          correctOptionId: 'b'
        }
      ]
    });
    await q.save();
    console.log('seeded quiz for course', course._id.toString());
  }
  await mongoose.disconnect();
  console.log('done');
}

seed().catch(err => { console.error(err); mongoose.disconnect(); });
