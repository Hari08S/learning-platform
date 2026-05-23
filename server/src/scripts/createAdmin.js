// server/src/scripts/createAdmin.js
// Run once: node src/scripts/createAdmin.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const ADMIN_NAME = 'Admin';
const ADMIN_EMAIL = 'admin@.com';
const ADMIN_PASSWORD = '123456';

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    // If user exists but not admin, upgrade them
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log(`✅ Upgraded existing user to admin: ${ADMIN_EMAIL}`);
    } else {
      console.log(`ℹ️  Admin already exists: ${ADMIN_EMAIL}`);
    }
  } else {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      passwordHash,
      role: 'admin',
    });
    console.log(`✅ Admin created!`);
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
  }

  await mongoose.disconnect();
  console.log('🔌 Disconnected.');
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
