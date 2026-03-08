const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: String, required: true },
    legacyCourseId: { type: Number }, // in case courseId isn't an ObjectId
    courseTitle: { type: String, required: true },
    courseImage: { type: String },
    lessonIndex: { type: Number, required: true },
    lessonTitle: { type: String, required: true },
    content: { type: String, required: true }
}, { timestamps: true });

NoteSchema.index({ userId: 1, courseId: 1, lessonIndex: 1 }, { unique: true });

module.exports = mongoose.models.Note || mongoose.model('Note', NoteSchema);
