const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const requireAuth = require('../middleware/auth');

// GET /api/me/notes/:courseId
router.get('/:courseId', requireAuth, async (req, res) => {
    try {
        const notes = await Note.find({
            userId: req.userId,
            courseId: req.params.courseId
        }).sort({ createdAt: -1 });

        res.json(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/me/notes
router.post('/', requireAuth, async (req, res) => {
    try {
        const { courseId, lessonId, timestamp, text } = req.body;

        if (!courseId || !lessonId || typeof timestamp !== 'number' || !text) {
            return res.status(400).json({ message: 'Missing required note fields' });
        }

        const note = await Note.create({
            userId: req.userId,
            courseId,
            lessonId,
            timestamp,
            text: text.substring(0, 500) // max 500 chars
        });

        res.status(201).json(note);
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({ message: 'Server error creating note' });
    }
});

// DELETE /api/me/notes/:noteId
router.delete('/:noteId', requireAuth, async (req, res) => {
    try {
        const note = await Note.findOneAndDelete({
            _id: req.params.noteId,
            userId: req.userId
        });

        if (!note) return res.status(404).json({ message: 'Note not found' });

        res.json({ success: true, message: 'Note deleted' });
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
