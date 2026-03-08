const mongoose = require('mongoose');

const DailyActivitySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    minutes: { type: Number, default: 0 }
}, { timestamps: true });

DailyActivitySchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.models.DailyActivity || mongoose.model('DailyActivity', DailyActivitySchema);
