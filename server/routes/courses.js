// server/routes/courses.js
const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

/**
 * Mounted at /api/courses
 */

// GET /api/courses -> list all courses
router.get('/', async (req, res) => {
  try {
    const items = await Course.find({}).sort({ createdAt: -1 }).lean();
    return res.json({ courses: items });
  } catch (err) {
    console.error('courses.list', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/courses/:id -> course detail
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id).lean();
    if (!course) return res.status(404).json({ message: 'Course not found' });
    return res.json({ course });
  } catch (err) {
    console.error('courses.detail', err);
    if (err && err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid course id format' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
