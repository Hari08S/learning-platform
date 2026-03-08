const express = require('express');
const router = express.Router();
const Internship = require('../models/Internship');

// GET /api/internships - Public list
router.get('/', async (req, res) => {
    try {
        const { domain, mode } = req.query;
        let query = { status: 'published' };

        if (domain && domain !== 'All') {
            query.domain = domain.toLowerCase();
        }
        if (mode && mode !== 'All') {
            query.mode = mode;
        }

        const internships = await Internship.find(query).sort({ createdAt: -1 });
        res.json({ internships });
    } catch (error) {
        console.error('Error fetching internships:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/internships/:id - Single info
router.get('/:id', async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id);
        if (!internship) return res.status(404).json({ message: 'Internship not found' });

        res.json({ internship });
    } catch (error) {
        console.error('Error fetching internship:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
