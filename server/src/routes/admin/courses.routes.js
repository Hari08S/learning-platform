// server/src/routes/admin/courses.routes.js
const express = require('express');
const router = express.Router();
const requireAdmin = require('../../middleware/requireAdmin');
const Course = require('../../models/Course');
const validate = require('../../middleware/validate');
const { createCourseRules } = require('../../validators/course.validator');

// GET /api/admin/courses
router.get('/courses', requireAdmin, async (req, res, next) => {
    try {
        const courses = await Course.find().sort({ createdAt: -1 }).lean();
        res.json({ courses });
    } catch (err) { next(err); }
});

// POST /api/admin/courses
router.post('/courses', requireAdmin, createCourseRules, validate, async (req, res, next) => {
    try {
        const payload = { ...req.body };
        // Auto-generate a generic curriculum if admin adds a course so it is a "complete course"
        if (!payload.curriculum || payload.curriculum.length === 0) {
            payload.curriculum = [
                { id: "1", title: "Introduction", mins: 15, preview: true, type: "lesson", body: "<h3>Welcome to the Course!</h3><p>In this introductory module, we will explore the foundational elements you will learn throughout this journey. Get ready for an intensive deep-dive!</p>" },
                { id: "2", title: "Core Concepts", mins: 35, preview: false, type: "lesson", body: "<h3>Diving Deeper</h3><p>Here you will get your hands dirty learning the core concepts and fundamental architecture. Practice makes perfect!</p>" },
                { id: "3", title: "Advanced Techniques", mins: 60, preview: false, type: "lesson", body: "<h3>Mastery</h3><p>Applying what you've learned in complex, real-world scenarios. We'll be tying everything together.</p>" },
                { id: "4", title: "Final Summary", mins: 10, preview: false, type: "lesson", body: "<h3>Conclusion</h3><p>Recap of everything we achieved and actionable next steps for your career.</p>" }
            ];
        }
        if (!payload.includes || payload.includes.length === 0) {
            payload.includes = ["Certificate of Completion", "Full Lifetime Access", "Access on Mobile and TV"];
        }

        const course = new Course(payload);
        await course.save();
        res.status(201).json({ course });
    } catch (err) { next(err); }
});

// PUT /api/admin/courses/:id
router.put('/courses/:id', requireAdmin, async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        Object.assign(course, req.body);
        await course.save(); // triggers pre-save hooks (hasQuiz)
        res.json({ course });
    } catch (err) { next(err); }
});

// DELETE /api/admin/courses/:id
router.delete('/courses/:id', requireAdmin, async (req, res, next) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json({ success: true, message: 'Course deleted' });
    } catch (err) { next(err); }
});

module.exports = router;
