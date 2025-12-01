// server/models/Purchase.js
const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  courseId: { type: mongoose.Schema.Types.Mixed, required: true }, // allow string/ObjectId/legacy id
  purchasedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Purchase || mongoose.model('Purchase', PurchaseSchema);
