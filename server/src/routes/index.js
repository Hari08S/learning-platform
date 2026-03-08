// server/src/routes/index.js
const express = require('express');
const router = express.Router();

// User routes
const authRoutes = require('./auth.routes');
const courseRoutes = require('./course.routes');
const purchaseRoutes = require('./purchase.routes');
const lessonRoutes = require('./lesson.routes');
const quizRoutes = require('./quiz.routes');
const progressRoutes = require('./progress.routes');
const activityRoutes = require('./activity.routes');
const badgeRoutes = require('./badge.routes');
const certificateRoutes = require('./certificate.routes');
const internshipsRoutes = require('./internships.routes');
const userInternshipsRoutes = require('./userInternships.routes');

// Admin routes
const adminRoutes = require('./admin');

// Mount user routes
router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
router.use('/', purchaseRoutes);
router.use('/', lessonRoutes);
router.use('/', quizRoutes);
router.use('/me', progressRoutes);
router.use('/', activityRoutes);
router.use('/', badgeRoutes);
router.use('/me', certificateRoutes);
router.use('/internships', internshipsRoutes);
router.use('/user/internships', userInternshipsRoutes);
router.use('/me/notes', require('./notes.routes'));

// Mount admin routes
router.use('/admin', adminRoutes);

module.exports = router;
