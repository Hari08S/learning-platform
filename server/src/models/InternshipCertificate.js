// server/src/models/InternshipCertificate.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // assuming uuid is installed, if not we'll use a random string

const InternshipCertificateSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User', index: true },
    internshipId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Internship', index: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'InternshipApplication', unique: true },
    issuedAt: { type: Date, default: Date.now },
    certificateId: {
        type: String,
        required: true,
        unique: true,
        default: () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) // Fallback random string
    },
}, {
    timestamps: true,
});

module.exports = mongoose.models.InternshipCertificate || mongoose.model('InternshipCertificate', InternshipCertificateSchema);
