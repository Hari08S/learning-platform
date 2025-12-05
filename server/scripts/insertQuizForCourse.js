// my-app/server/scripts/insertQuizForCourse.js
const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const Course = require('../models/Course');

const DB = process.env.MONGO_URI || 'mongodb://localhost:27017/upwise'; // adjust DB name if needed
const COURSE_ID = process.argv[2]; // pass courseId as arg

if (!COURSE_ID) {
  console.error('Usage: node insertQuizForCourse.js <courseId>');
  process.exit(1);
}

async function run() {
  await mongoose.connect(DB, { useNewUrlParser: true, useUnifiedTopology: true });
  const course = await Course.findById(COURSE_ID);
  if (!course) {
    console.error('Course not found:', COURSE_ID);
    process.exit(1);
  }
  const exists = await Quiz.findOne({ courseId: course._id });
  if (exists) {
    console.log('Quiz already exists for course:', COURSE_ID);
    process.exit(0);
  }

  const q = new Quiz({
    courseId: course._id,
    title: `${course.title} — Final Quiz`,
    estimatedMins: 10,
    passingPercentage: 50,
    questions: [
      {
        text: 'What is the main topic of the first lesson?',
        options: [{ id: 'a', text: 'Introduction to React' }, { id: 'b', text: 'Advanced CSS' }, { id: 'c', text: 'Databases' }],
        correctOptionId: 'a',
        points: 1
      },
      {
        text: 'Which hook is used to store state?',
        options: [{ id: 'a', text: 'useState' }, { id: 'b', text: 'useEffect' }, { id: 'c', text: 'useContext' }],
        correctOptionId: 'a',
        points: 1
      },
      {
        text: 'Which tool handles routing in this course?',
        options: [{ id: 'a', text: 'react-router' }, { id: 'b', text: 'express' }, { id: 'c', text: 'mongoose' }],
        correctOptionId: 'a',
        points: 1
      }
    ]
  });

  await q.save();
  console.log('Inserted quiz for course', COURSE_ID);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => { console.error(err); mongoose.disconnect(); process.exit(1); });
