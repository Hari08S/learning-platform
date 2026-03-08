// server/src/models/QuizResult.js
const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
    questionId: { type: String, required: true },
    selectedOptionId: { type: String, required: false },
    correct: { type: Boolean, required: true },
}, { _id: false });

const QuizResultSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    quizId: { type: mongoose.Schema.Types.Mixed, required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    percentage: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    timeTakenSeconds: { type: Number, default: 0 },
    answers: { type: [AnswerSchema], default: [] },
}, {
    timestamps: true,
});

// Index for quick user+course quiz result lookup
QuizResultSchema.index({ userId: 1, courseId: 1 });

module.exports = mongoose.models.QuizResult || mongoose.model('QuizResult', QuizResultSchema);
