// server/scripts/seedQuiz.js
require('dotenv').config();
const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const Course = require('../models/Course');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upwise';

function generateQuestionsForCourse(course) {
  const title = course.title || 'This course';
  const curriculum = Array.isArray(course.curriculum) ? course.curriculum : [];
  const questions = [];

  questions.push({
    id: `q-${course._id}-1`,
    question: `What is the main purpose of "${title}"?`,
    choices: ["To learn basics", "To watch movies", "To play games", "None of these"],
    answerIndex: 0
  });

  questions.push({
    id: `q-${course._id}-2`,
    question: `This course "${title}" contains how many modules?`,
    choices: [
      `${Math.max(1, Math.floor(curriculum.length / 2))}–${curriculum.length}`,
      "1–3",
      "10+",
      "None"
    ],
    answerIndex: 0
  });

  for (let i = 0; i < Math.min(3, curriculum.length); i++) {
    const item = curriculum[i];
    questions.push({
      id: `q-${course._id}-${3 + i}`,
      question: `Which topic is covered in module ${i + 1}?`,
      choices: [
        item.title || 'Module content',
        'Unrelated topic',
        'Another topic',
        'None'
      ],
      answerIndex: 0
    });
  }

  while (questions.length < 5) {
    questions.push({
      id: `q-${course._id}-extra-${questions.length}`,
      question: `True or false: ${title} includes hands-on practice?`,
      choices: ["True", "False", "Sometimes", "Never"],
      answerIndex: 0
    });
  }

  return questions;
}

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const courses = await Course.find({});
    if (!courses.length) {
      console.log("No courses found. Seed courses first.");
      process.exit(0);
    }

    for (const course of courses) {
      const existing = await Quiz.findOne({ courseId: course._id });
      if (existing) {
        console.log(`Quiz exists for "${course.title}" — skipping.`);
        continue;
      }
      const quiz = new Quiz({
        courseId: course._id,
        questions: generateQuestionsForCourse(course)
      });
      await quiz.save();
      console.log(`Created quiz for "${course.title}"`);
    }

    console.log("Quiz seeding complete.");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
