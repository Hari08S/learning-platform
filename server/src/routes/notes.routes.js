const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const Note = require('../models/Note');

// GET /api/me/notes
router.get('/', requireAuth, async (req, res, next) => {
    try {
        const notes = await Note.find({ userId: req.userId }).sort({ updatedAt: -1 }).lean();
        res.json({ notes });
    } catch (err) {
        next(err);
    }
});

// POST /api/me/notes/:courseId/:lessonIndex
router.post('/:courseId/:lessonIndex', requireAuth, async (req, res, next) => {
    try {
        const { courseId, lessonIndex } = req.params;
        const { courseTitle, courseImage, lessonTitle, content } = req.body;

        const note = await Note.findOneAndUpdate(
            { userId: req.userId, courseId, lessonIndex: parseInt(lessonIndex, 10) },
            { $set: { courseTitle, courseImage, lessonTitle, content, updatedAt: new Date() } },
            { new: true, upsert: true }
        );
        res.json({ note });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/me/notes/:courseId/:lessonIndex
router.delete('/:courseId/:lessonIndex', requireAuth, async (req, res, next) => {
    try {
        const { courseId, lessonIndex } = req.params;
        await Note.findOneAndDelete({ userId: req.userId, courseId, lessonIndex: parseInt(lessonIndex, 10) });
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
