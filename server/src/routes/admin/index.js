// server/src/routes/admin/index.js
const express = require('express');
const router = express.Router();

const dashboardRoutes = require('./dashboard.routes');
const usersRoutes = require('./users.routes');
const coursesRoutes = require('./courses.routes');
const purchasesRoutes = require('./purchases.routes');
const certificatesRoutes = require('./certificates.routes');
const profileRoutes = require('./profile.routes');
const adminInternshipsRoutes = require('./internships.routes');

router.use(dashboardRoutes);
router.use(usersRoutes);
router.use(coursesRoutes);
router.use(purchasesRoutes);
router.use(certificatesRoutes);
router.use('/profile', profileRoutes);
router.use(adminInternshipsRoutes);

module.exports = router;
