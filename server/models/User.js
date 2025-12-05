// server/models/User.js
const mongoose = require('mongoose');

const PurchasedSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.Mixed, ref: 'Course' }, // accept ObjectId or string
  price: Number,
  purchasedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'cancelled'], default: 'active' },
  cancelledAt: Date
}, { _id: false });

const ProgressSchema = new mongoose.Schema({
  // make courseId flexible (some seed data uses strings), store either ObjectId or string
  courseId: { type: mongoose.Schema.Types.Mixed },
  percent: { type: Number, default: 0 },
  hoursLearned: { type: Number, default: 0 }, // stored as hours (float)
  lastSeenAt: Date,
  completedAt: Date,
  completedLessons: [{ type: mongoose.Schema.Types.Mixed }],
  quizPassed: { type: Boolean, default: false }
}, { _id: false });

const BadgeSchema = new mongoose.Schema({
  id: String,
  title: String,
  icon: String,
  earnedAt: Date,
  description: String
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  purchasedCourses: [PurchasedSchema],
  progress: [ProgressSchema],
  badges: [BadgeSchema],
  certificates: [{
    courseId: { type: mongoose.Schema.Types.Mixed, ref: 'Course' },
    filename: String,
    issuedOn: Date,
    certId: String,
    title: String
  }],
  createdAt: { type: Date, default: Date.now },
  streakDays: { type: Number, default: 0 }
});

// safe export to avoid OverwriteModelError on hot reload/nodemon
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
