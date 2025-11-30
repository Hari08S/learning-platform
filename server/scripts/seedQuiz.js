// server/scripts/seedQuiz.js
require('dotenv').config();
const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const Course = require('../models/Course');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upwise';


async function seed() {
  try {
    console.log("Connecting to DB:", MONGO_URI);
    await mongoose.connect(MONGO_URI);

    const courses = await Course.find({});
    if (!courses.length) {
      console.log("No courses found. Seed courses first.");
      process.exit(0);
    }

    for (const course of courses) {
      const existing = await Quiz.findOne({ courseId: course._id });
      if (existing) {
        console.log(`Quiz already exists for course ${course.title} — skipping`);
        continue;
      }

      const quiz = new Quiz({
        courseId: course._id,
        questions: [
          {
            id: "q1",
            question: `What is the main purpose of ${course.title}?`,
            choices: ["To learn basics", "To watch movies", "To play games", "None"],
            answerIndex: 0
          },
          {
            id: "q2",
            question: "How many modules are usually in this course?",
            choices: ["1–3", "3–6", "6–10", "10+"],
            answerIndex: 1
          },
          {
            id: "q3",
            question: "Is hands-on practice recommended?",
            choices: ["Yes", "No", "Sometimes", "Never"],
            answerIndex: 0
          },
          {
            id: "q4",
            question: "Who should take this course?",
            choices: ["Students", "Developers", "Anyone learning", "Only experts"],
            answerIndex: 2
          },
          {
            id: "q5",
            question: "What do you receive after completing?",
            choices: ["A cookie", "Nothing", "Certificate", "Laptop"],
            answerIndex: 2
          }
        ]
      });

      await quiz.save();
      console.log(`Quiz created for: ${course.title}`);
    }

    console.log("Quiz seeding complete ✔️");
    process.exit(0);

  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
