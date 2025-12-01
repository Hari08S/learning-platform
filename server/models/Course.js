// server/models/Course.js
const mongoose = require('mongoose');

const CurriculumItem = new mongoose.Schema({
  id: mongoose.Schema.Types.Mixed, // allow numeric or string ids from seed data
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

const CourseSchema = new mongoose.Schema({
  legacyId: { type: mongoose.Schema.Types.Mixed, default: null }, // original numeric id from seed
  title: { type: String, required: true },
  author: String,
  hours: String,
  students: Number,
  level: String,
  price: mongoose.Schema.Types.Mixed, // keep raw price, numeric price stored separately below
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

module.exports = mongoose.models.Course || mongoose.model('Course', CourseSchema);
