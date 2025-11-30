// server/models/Course.js
const mongoose = require('mongoose');

const CurriculumItem = new mongoose.Schema({
  id: mongoose.Schema.Types.Mixed, // number or string
  title: String,
  mins: Number,
  preview: { type: Boolean, default: false },
  body: String,       // optional lesson content (HTML/Markdown)
  type: String        // optional: 'quiz' for quiz module
}, { _id: false });

const InstructorSchema = new mongoose.Schema({
  name: String,
  bio: String,
  rating: Number,
  students: Number,
  courses: Number
}, { _id: false });

const CourseSchema = new mongoose.Schema({
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
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', CourseSchema);
