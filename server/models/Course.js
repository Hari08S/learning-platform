// server/models/Course.js
const mongoose = require('mongoose');

const CurriculumItem = new mongoose.Schema({
  id: Number,
  title: String,
  mins: Number,
  preview: { type: Boolean, default: false }
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
  price: mongoose.Schema.Types.Mixed, // accept number or string
  priceNumber: { type: Number, default: 0 }, // numeric price for computations
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
