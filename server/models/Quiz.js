// server/models/Course.js
const mongoose = require('mongoose');

const CurriculumItem = new mongoose.Schema({
  id: mongoose.Schema.Types.Mixed,
  title: String,
  mins: Number,
  preview: { type: Boolean, default: false },
  type: { type: String, default: 'lesson' },
  body: String
}, { _id: false });

const InstructorSchema = new mongoose.Schema({
  name: String,
  bio: String,
  rating: Number,
  students: Number,
  courses: Number
}, { _id: false });

// 1. Define the Embedded Quiz Schema
const QuizOptionSchema = new mongoose.Schema({
  id: String,
  text: String
}, { _id: false });

const QuizQuestionSchema = new mongoose.Schema({
  _id: { type: String }, // Allow custom string IDs like 'r-int-1'
  id: { type: String },
  text: String,
  question: String, // fallback
  options: [QuizOptionSchema],
  correctOptionId: String,
  points: { type: Number, default: 1 }
});

const EmbeddedQuizSchema = new mongoose.Schema({
  _id: { type: String }, 
  title: String,
  estimatedMins: Number,
  passingPercentage: Number,
  questions: [QuizQuestionSchema]
});

const CourseSchema = new mongoose.Schema({
  legacyId: { type: mongoose.Schema.Types.Mixed, default: null },
  title: { type: String, required: true },
  author: String,
  hours: String,
  students: Number,
  level: String,
  price: mongoose.Schema.Types.Mixed,
  priceNumber: { type: Number, default: 0 },
  img: String,
  tag: String,
  rating: Number,
  description: String,
  includes: [String],
  curriculum: [CurriculumItem],
  instructor: InstructorSchema,
  
  // 2. Add the quiz field to the Course Schema
  quiz: { type: EmbeddedQuizSchema, default: null },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Course || mongoose.model('Course', CourseSchema);