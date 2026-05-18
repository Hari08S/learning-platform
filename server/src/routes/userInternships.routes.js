const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const Internship = require('../models/Internship');
const InternshipApplication = require('../models/InternshipApplication');
const InternshipSubmission = require('../models/InternshipSubmission');
const InternshipCertificate = require('../models/InternshipCertificate');

router.use(requireAuth);

// GET /api/user/internships/my
router.get('/my', async (req, res) => {
    try {
        const applications = await InternshipApplication.find({ userId: req.userId })
            .populate('internshipId', 'title company thumbnail duration mode status')
            .sort({ enrolledAt: -1 });

        res.json({ applications });
    } catch (error) {
        console.error('Error fetching your internships:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/user/internships/:id/portal
router.get('/:id/portal', async (req, res) => {
    try {
        const application = await InternshipApplication.findOne({
            internshipId: req.params.id,
            userId: req.userId
        }).populate('internshipId');

        if (!application) {
            return res.status(404).json({ message: 'Not enrolled in this internship' });
        }

        const submissions = await InternshipSubmission.find({ applicationId: application._id });

        res.json({ application, internship: application.internshipId, submissions });
    } catch (error) {
        console.error('Error fetching portal:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/user/internships/:id/apply
router.post('/:id/apply', async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id);
        if (!internship) return res.status(404).json({ message: 'Internship not found' });
        if (internship.status !== 'published') return res.status(400).json({ message: 'Internship is not open for enrollment' });

        const existing = await InternshipApplication.findOne({ userId: req.userId, internshipId: internship._id });
        if (existing) return res.status(400).json({ message: 'Already enrolled' });

        const application = new InternshipApplication({
            userId: req.userId,
            internshipId: internship._id,
            amount: internship.fee,
            status: 'active',
            progress: 0
        });

        await application.save();

        res.status(201).json({ message: 'Enrolled successfully', application });
    } catch (error) {
        console.error('Error applying:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/user/internships/:id/withdraw
router.delete('/:id/withdraw', async (req, res) => {
    try {
        const application = await InternshipApplication.findOne({
            internshipId: req.params.id,
            userId: req.userId
        });

        if (!application) {
            return res.status(404).json({ message: 'No enrollment found for this internship' });
        }

        if (application.status === 'completed') {
            return res.status(400).json({ message: 'Cannot withdraw from a completed internship' });
        }

        // Remove all task submissions for this application
        await InternshipSubmission.deleteMany({ applicationId: application._id });

        // Remove the application itself
        await InternshipApplication.findByIdAndDelete(application._id);

        res.json({ success: true, message: 'Successfully withdrawn from internship' });
    } catch (error) {
        console.error('Error withdrawing from internship:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/user/internships/:id/submit/:taskIndex
router.post('/:id/submit/:taskIndex', async (req, res) => {
    try {
        const { submissionText, submissionLink } = req.body;
        const taskIndex = parseInt(req.params.taskIndex);

        const application = await InternshipApplication.findOne({
            internshipId: req.params.id,
            userId: req.userId
        });

        if (!application) return res.status(404).json({ message: 'Not enrolled' });

        // Upsert submission
        let submission = await InternshipSubmission.findOne({ applicationId: application._id, taskIndex });

        if (submission && submission.status === 'approved') {
            return res.status(400).json({ message: 'Task already approved, cannot resubmit' });
        }

        if (submission) {
            submission.submissionText = submissionText;
            submission.submissionLink = submissionLink;
            submission.status = 'pending';
            submission.submittedAt = Date.now();
            await submission.save();
        } else {
            submission = new InternshipSubmission({
                applicationId: application._id,
                userId: req.userId,
                internshipId: application.internshipId,
                taskIndex,
                submissionText,
                submissionLink,
                status: 'pending'
            });
            await submission.save();
        }

        res.json({ message: 'Task submitted', submission });
    } catch (error) {
        console.error('Error submitting task:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/user/internships/:id/certificate
router.get('/:id/certificate', async (req, res) => {
    try {
        const application = await InternshipApplication.findOne({
            internshipId: req.params.id,
            userId: req.userId
        });

        if (!application || application.status !== 'completed') {
            return res.status(400).json({ message: 'Certificate not available yet.' });
        }

        const cert = await InternshipCertificate.findOne({ applicationId: application._id })
            .populate('userId', 'name email avatar')
            .populate('internshipId', 'title company duration mode');

        if (!cert) return res.status(404).json({ message: 'Certificate record not found.' });

        res.json({ certificate: cert });
    } catch (error) {
        console.error('Error fetching certificate:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
