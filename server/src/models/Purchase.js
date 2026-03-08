// server/src/models/Purchase.js
const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User', index: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Course', index: true },
    amount: { type: Number, default: 0 },
    status: { type: String, enum: ['completed', 'refunded', 'pending'], default: 'completed' },
}, {
    timestamps: true,
});

// Compound index for fast user+course lookup
PurchaseSchema.index({ userId: 1, courseId: 1 });

module.exports = mongoose.models.Purchase || mongoose.model('Purchase', PurchaseSchema);
