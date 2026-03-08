const express = require('express');
const router = express.Router();

const requireAdmin = require('../middleware/requireAdmin');
const User = require('../models/User');

// GET /api/admin/users
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('_id name email role createdAt')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      users: users.map(u => ({
        id: String(u._id),
        name: u.name,
        email: u.email,
        role: u.role,
        joinedOn: u.createdAt
      }))
    });
  } catch (err) {
    console.error('Admin users error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
