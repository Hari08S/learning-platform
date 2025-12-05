// server/models/QuizResult.js
const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  selectedOptionId: { type: String, required: false },
  correct: { type: Boolean, required: true }
}, { _id: false });

const QuizResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quizId: { type: mongoose.Schema.Types.Mixed, required: true }, // course.quiz._id or course._id
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  score: { type: Number, required: true },   // weighted points correct or number correct
  total: { type: Number, required: true },   // total possible points / questions
  percentage: { type: Number, required: true },
  passed: { type: Boolean, required: true },
  timeTakenSeconds: { type: Number, default: 0 },
  answers: { type: [AnswerSchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.models.QuizResult || mongoose.model('QuizResult', QuizResultSchema);
