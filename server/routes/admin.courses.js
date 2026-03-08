const express = require('express');
const router = express.Router();

const requireAdmin = require('../middleware/requireAdmin');
const Course = require('../models/Course');

// GET /api/admin/courses
router.get('/courses', requireAdmin, async (req, res) => {
  const courses = await Course.find().sort({ createdAt: -1 }).lean();
  res.json({ courses });
});

// POST /api/admin/courses
router.post('/courses', requireAdmin, async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ message: 'Invalid course data' });
  }
});

// PUT /api/admin/courses/:id
router.put('/courses/:id', requireAdmin, async (req, res) => {
  const updated = await Course.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
});

// DELETE /api/admin/courses/:id
router.delete('/courses/:id', requireAdmin, async (req, res) => {
  await Course.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
