// server/src/routes/certificate.routes.js
const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const crypto = require('crypto');

// GET /api/me/certificates
router.get('/certificates', requireAuth, async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).lean();
        if (!user) return res.status(404).json({ message: 'User not found' });
        return res.json({ certificates: user.certificates || [] });
    } catch (err) { next(err); }
});

// POST /api/me/certificates
router.post('/certificates', requireAuth, async (req, res, next) => {
    try {
        const { courseId } = req.body;
        if (!courseId) return res.status(400).json({ message: 'courseId required' });

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const course = await Course.findById(courseId).lean();
        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Check completion
        const prog = (user.progress || []).find(p => String(p.courseId) === String(courseId));
        if (!prog || !prog.quizPassed || prog.percent < 100) {
            return res.status(400).json({ message: 'Course not completed yet' });
        }

        // Check if already issued
        const existing = (user.certificates || []).find(c => String(c.courseId) === String(courseId));
        if (existing) return res.json({ certificate: existing, message: 'Already issued' });

        const certId = `CERT-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
        const cert = {
            courseId,
            title: course.title,
            issuedOn: new Date(),
            certId,
            filename: `${certId}.pdf`,
        };

        user.certificates = user.certificates || [];
        user.certificates.push(cert);
        await user.save();

        return res.status(201).json({ certificate: cert });
    } catch (err) { next(err); }
});

module.exports = router;
