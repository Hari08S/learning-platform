// server/src/models/Course.js
const mongoose = require('mongoose');

const CurriculumItem = new mongoose.Schema({
    id: mongoose.Schema.Types.Mixed,
    title: String,
    mins: Number,
    preview: { type: Boolean, default: false },
    type: { type: String, default: 'lesson' },
    body: String,
    content: String,
    videoUrl: String,
}, { _id: false });

const InstructorSchema = new mongoose.Schema({
    name: String,
    bio: String,
    rating: Number,
    students: Number,
    courses: Number,
    avatar: String,
}, { _id: false });


const CourseOptionSchema = new mongoose.Schema({
    id: { type: String },
    text: { type: String },
}, { _id: false });

const CourseQuestionSchema = new mongoose.Schema({
    id: { type: mongoose.Schema.Types.Mixed },
    _id: { type: mongoose.Schema.Types.Mixed },
    text: { type: String },
    question: { type: String }, // legacy field name
    options: { type: [CourseOptionSchema], default: [] },
    correctOptionId: { type: String, default: null },
    points: { type: Number, default: 1 },
}, { _id: false });

const CourseQuizSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.Mixed },
    title: { type: String },
    estimatedMins: { type: Number, default: 10 },
    passingPercentage: { type: Number, default: 50 },
    questions: { type: [CourseQuestionSchema], default: [] },
}, { _id: false });

const CourseSchema = new mongoose.Schema({
    legacyId: { type: mongoose.Schema.Types.Mixed, default: null },
    title: { type: String, required: true, trim: true },
    author: { type: String, trim: true },
    hours: String,
    students: { type: Number, default: 0 },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'], default: 'All Levels' },
    price: mongoose.Schema.Types.Mixed,
    priceNumber: { type: Number, default: 0 },
    img: String,
    tag: String,
    rating: { type: Number, default: 0, min: 0, max: 5 },
    description: { type: String, default: '' },
    includes: [String],
    curriculum: [CurriculumItem],
    instructor: InstructorSchema,
    quiz: { type: CourseQuizSchema, default: null },
    hasQuiz: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
}, {
    timestamps: true,
});

// Ensure hasQuiz mirrors quiz presence on save
CourseSchema.pre('save', function (next) {
    this.hasQuiz = !!(this.quiz && Array.isArray(this.quiz.questions) && this.quiz.questions.length > 0);
    next();
});

// Indexes
CourseSchema.index({ title: 'text', description: 'text' });
CourseSchema.index({ tag: 1 });
CourseSchema.index({ level: 1 });
CourseSchema.index({ isPublished: 1 });

module.exports = mongoose.models.Course || mongoose.model('Course', CourseSchema);
