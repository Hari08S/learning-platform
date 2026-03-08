// server/src/models/InternshipApplication.js
const mongoose = require('mongoose');

const InternshipApplicationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User', index: true },
    internshipId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Internship', index: true },
    amount: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active'
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    enrolledAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
}, {
    timestamps: true,
});

// A user should only have one application per internship
InternshipApplicationSchema.index({ userId: 1, internshipId: 1 }, { unique: true });

module.exports = mongoose.models.InternshipApplication || mongoose.model('InternshipApplication', InternshipApplicationSchema);
