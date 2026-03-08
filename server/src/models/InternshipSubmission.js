// server/src/models/InternshipSubmission.js
const mongoose = require('mongoose');

const InternshipSubmissionSchema = new mongoose.Schema({
    applicationId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'InternshipApplication', index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User', index: true },
    internshipId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Internship', index: true },
    taskIndex: { type: Number, required: true },
    submissionText: { type: String, default: '' },
    submissionLink: { type: String, default: '' },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    adminFeedback: { type: String, default: '' },
    submittedAt: { type: Date, default: Date.now },
}, {
    timestamps: true,
});

// To easily lookup a submission for a specific task per application
InternshipSubmissionSchema.index({ applicationId: 1, taskIndex: 1 }, { unique: true });

module.exports = mongoose.models.InternshipSubmission || mongoose.model('InternshipSubmission', InternshipSubmissionSchema);
