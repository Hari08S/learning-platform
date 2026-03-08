// server/src/models/User.js
const mongoose = require('mongoose');

const PurchasedSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    price: { type: Number, default: 0 },
    purchasedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'cancelled'], default: 'active' },
    cancelledAt: Date,
}, { _id: true });

const ProgressSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    percent: { type: Number, default: 0 },
    hoursLearned: { type: Number, default: 0 },
    lastSeenAt: Date,
    completedAt: Date,
    completedLessons: [{ type: mongoose.Schema.Types.Mixed }],
    quizPassed: { type: Boolean, default: false },
}, { _id: false });

const BadgeSchema = new mongoose.Schema({
    id: String,
    title: String,
    icon: String,
    earnedAt: Date,
    description: String,
}, { _id: false });

const CertificateSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    filename: String,
    issuedOn: Date,
    certId: String,
    title: String,
}, { _id: false });

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    passwordHash: { type: String, required: true },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    avatar: { type: String, default: null },
    bio: { type: String, default: '', maxlength: 500 },
    purchasedCourses: [PurchasedSchema],
    progress: [ProgressSchema],
    badges: [BadgeSchema],
    certificates: [CertificateSchema],
    streakDays: { type: Number, default: 0 },
    lastActiveAt: Date,
    wishlist: [{ type: String }], // Store legacy/ObjectIDs
    weeklyGoalMinutes: { type: Number, default: 0 },
    currentCourseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null }
}, {
    timestamps: true, // adds createdAt & updatedAt automatically
});

// Index for faster lookups
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
