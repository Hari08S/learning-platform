// server/src/models/Internship.js
const mongoose = require('mongoose');

const InternshipTaskSchema = new mongoose.Schema({
    title: String,
    description: String,
    dueInDays: Number,
    resources: [String],
    order: Number,
}, { _id: false });

const InternshipSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    company: { type: String, trim: true },
    domain: {
        type: String,
        enum: ['tech', 'software', 'data', 'marketing', 'design', 'finance', 'other'],
        default: 'tech'
    },
    duration: String,
    mode: {
        type: String,
        enum: ['Remote', 'Hybrid', 'On-site'],
        default: 'Remote'
    },
    stipend: String,
    fee: { type: Number, required: true, default: 0 },
    seats: { type: Number, default: 0 },
    thumbnail: String,
    skills: [String],
    mentorName: String,
    mentorBio: String,
    mentorAvatar: String,
    tasks: { type: [InternshipTaskSchema], default: [] },
    status: {
        type: String,
        enum: ['draft', 'published', 'closed'],
        default: 'draft'
    },
}, {
    timestamps: true,
});

// Indexes for searching/filtering
InternshipSchema.index({ title: 'text', company: 'text', description: 'text', skills: 'text' });
InternshipSchema.index({ domain: 1 });
InternshipSchema.index({ mode: 1 });
InternshipSchema.index({ status: 1 });

module.exports = mongoose.models.Internship || mongoose.model('Internship', InternshipSchema);
