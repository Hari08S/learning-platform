const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: String, required: true },
    legacyCourseId: { type: Number }, // in case courseId isn't an ObjectId
    courseTitle: { type: String, required: false },
    courseImage: { type: String },
    lessonIndex: { type: Number, required: false },
    lessonTitle: { type: String, required: false }, // made optional to support new feature
    content: { type: String, required: false },
    lessonId: { type: mongoose.Schema.Types.Mixed },
    timestamp: { type: Number },
    text: { type: String, maxlength: 500 }
}, { timestamps: true });

module.exports = mongoose.models.Note || mongoose.model('Note', NoteSchema);
