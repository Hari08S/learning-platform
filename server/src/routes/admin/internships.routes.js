const express = require('express');
const router = express.Router();
const requireAuth = require('../../middleware/auth');
const requireAdmin = require('../../middleware/requireAdmin');
const Internship = require('../../models/Internship');
const InternshipApplication = require('../../models/InternshipApplication');
const InternshipSubmission = require('../../models/InternshipSubmission');
const InternshipCertificate = require('../../models/InternshipCertificate');
const User = require('../../models/User');

router.use(requireAuth, requireAdmin);

// GET /api/admin/submissions
router.get('/submissions', async (req, res) => {
    try {
        const submissions = await InternshipSubmission.find()
            .populate('userId', 'name email avatar')
            .populate('internshipId', 'title company domain')
            .sort({ submittedAt: -1 });
        res.json({ submissions });
    } catch (error) {
        console.error('Admin Fetch Submissions Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/admin/internships
router.get('/internships', async (req, res) => {
    try {
        const internships = await Internship.find().sort({ createdAt: -1 });

        // Count applicants for each
        const results = await Promise.all(internships.map(async (internship) => {
            const applicantsCount = await InternshipApplication.countDocuments({ internshipId: internship._id });
            return {
                ...internship.toObject(),
                applicantsCount
            };
        }));

        res.json({ internships: results });
    } catch (error) {
        console.error('Admin Fetch Internships Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/admin/internships
router.post('/internships', async (req, res) => {
    try {
        const internship = new Internship({ ...req.body, status: 'draft' });
        await internship.save();
        res.status(201).json({ message: 'Internship created', internship });
    } catch (error) {
        console.error('Error creating internship:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/admin/internships/:id
router.put('/internships/:id', async (req, res) => {
    try {
        const internship = await Internship.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!internship) return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Updated successfully', internship });
    } catch (error) {
        console.error('Error updating internship:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/admin/internships/:id
router.delete('/internships/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await Internship.findByIdAndDelete(id);
        await InternshipApplication.deleteMany({ internshipId: id });
        await InternshipSubmission.deleteMany({ internshipId: id });
        await InternshipCertificate.deleteMany({ internshipId: id });
        res.json({ message: 'Deleted thoroughly' });
    } catch (error) {
        console.error('Error deleting:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PATCH /api/admin/internships/:id/status
router.patch('/internships/:id/status', async (req, res) => {
    try {
        let { status, isPublished } = req.body;

        if (isPublished !== undefined) {
            status = isPublished ? 'published' : 'draft';
        }

        if (!status) return res.status(400).json({ message: 'Status is required' });

        const internship = await Internship.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json({ message: 'Status updated', internship });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/admin/internships/:id/applicants
router.get('/internships/:id/applicants', async (req, res) => {
    try {
        const applications = await InternshipApplication.find({ internshipId: req.params.id })
            .populate('userId', 'name email avatar')
            .sort({ enrolledAt: -1 })
            .lean();

        // Fetch all submissions for this internship and group by applicationId
        const allSubmissions = await InternshipSubmission.find({ internshipId: req.params.id })
            .sort({ taskIndex: 1 })
            .lean();

        const subsByApp = {};
        allSubmissions.forEach(sub => {
            const appId = String(sub.applicationId);
            if (!subsByApp[appId]) subsByApp[appId] = [];
            subsByApp[appId].push(sub);
        });

        // Attach submissions to each application
        const enriched = applications.map(app => ({
            ...app,
            submissions: subsByApp[String(app._id)] || []
        }));

        res.json({ applications: enriched });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/admin/internships/:id/submissions
router.get('/internships/:id/submissions', async (req, res) => {
    try {
        const submissions = await InternshipSubmission.find({ internshipId: req.params.id })
            .populate('userId', 'name email avatar')
            .sort({ submittedAt: -1 });
        res.json({ submissions });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// PATCH /api/admin/submissions/:submissionId
router.patch('/submissions/:submissionId', async (req, res) => {
    try {
        const { status, adminFeedback } = req.body; // status: 'approved' | 'rejected'
        const submission = await InternshipSubmission.findByIdAndUpdate(req.params.submissionId, { status, adminFeedback }, { new: true });
        if (!submission) return res.status(404).json({ message: 'Submission not found' });

        // Recalculate progress
        const application = await InternshipApplication.findById(submission.applicationId);
        if (application) {
            const internship = await Internship.findById(application.internshipId);
            if (internship && internship.tasks.length > 0) {
                const approvedCount = await InternshipSubmission.countDocuments({
                    applicationId: application._id,
                    status: 'approved'
                });
                const progress = Math.round((approvedCount / internship.tasks.length) * 100);
                application.progress = progress;

                // Auto-complete when all tasks are approved (100%)
                if (progress >= 100 && application.status !== 'completed') {
                    application.status = 'completed';
                    application.completedAt = new Date();

                    // Auto-generate certificate
                    let cert = await InternshipCertificate.findOne({ applicationId: application._id });
                    if (!cert) {
                        cert = new InternshipCertificate({
                            userId: application.userId,
                            internshipId: application.internshipId,
                            applicationId: application._id
                        });
                        await cert.save();
                        console.log(`✅ Auto-generated certificate for user ${application.userId} — internship ${internship.title}`);
                    }
                }

                await application.save();
            }
        }

        res.json({ message: 'Submission updated', submission });
    } catch (error) {
        console.error('Submission Patch Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/admin/internships/:id/complete/:userId
router.post('/internships/:id/complete/:userId', async (req, res) => {
    try {
        const application = await InternshipApplication.findOne({ internshipId: req.params.id, userId: req.params.userId });
        if (!application) return res.status(404).json({ message: 'Application not found' });

        application.status = 'completed';
        application.completedAt = Date.now();
        application.progress = 100;
        await application.save();

        let cert = await InternshipCertificate.findOne({ applicationId: application._id });
        if (!cert) {
            cert = new InternshipCertificate({
                userId: req.params.userId,
                internshipId: req.params.id,
                applicationId: application._id
            });
            await cert.save();
        }

        res.json({ message: 'Marked as complete', certificate: cert });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
