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

/**
 * Quiz sub-schemas for embedding quiz directly in Course
 */
const CourseOptionSchema = new mongoose.Schema({
  id: { type: String },
  text: { type: String }
}, { _id: false });

const CourseQuestionSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.Mixed },
  _id: { type: mongoose.Schema.Types.Mixed }, // allow seeded string ids
  text: { type: String },
  question: { type: String }, // legacy field name
  options: { type: [CourseOptionSchema], default: [] },
  correctOptionId: { type: String, default: null },
  points: { type: Number, default: 1 }
}, { _id: false });

const CourseQuizSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.Mixed },
  title: { type: String },
  estimatedMins: { type: Number, default: 10 },
  passingPercentage: { type: Number, default: 50 },
  questions: { type: [CourseQuestionSchema], default: [] }
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
  // NEW: embed quiz directly on Course (optional)
  quiz: { type: CourseQuizSchema, default: null },
  hasQuiz: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// ensure hasQuiz mirrors quiz presence on save (convenience)
CourseSchema.pre('save', function(next) {
  this.hasQuiz = !!(this.quiz && Array.isArray(this.quiz.questions) && this.quiz.questions.length > 0);
  next();
});

module.exports = mongoose.models.Course || mongoose.model('Course', CourseSchema);
