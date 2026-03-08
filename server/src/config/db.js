// server/src/config/db.js
const mongoose = require('mongoose');

module.exports = async function connectDB(mongoUri) {
    const uri = mongoUri || process.env.MONGO_URI || 'mongodb://localhost:27017/';
    const normalized = uri.endsWith('/') ? `${uri}upwise` : uri;
    try {
        await mongoose.connect(normalized);
        console.log('✅ MongoDB connected:', normalized);
    } catch (err) {
        console.error('❌ MongoDB connect error:', err.message);
        process.exit(1);
    }
};
