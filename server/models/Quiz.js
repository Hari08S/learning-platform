// server/models/Quiz.js
const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  id: String,
  question: String,
  choices: [String],
  answerIndex: Number
}, { _id: false });

const QuizSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Course' },
  questions: [QuestionSchema],
  createdAt: { type: Date, default: Date.now }
});

// safe export
module.exports = mongoose.models.Quiz || mongoose.model('Quiz', QuizSchema);
