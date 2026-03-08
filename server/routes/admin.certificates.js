const express = require('express');
const router = express.Router();

const requireAdmin = require('../middleware/requireAdmin');
const User = require('../models/User');

// GET /api/admin/certificates
router.get('/certificates', requireAdmin, async (req, res) => {
  const users = await User.find(
    { 'certificates.0': { $exists: true } },
    { name: 1, email: 1, certificates: 1 }
  ).lean();

  const certificates = [];

  users.forEach(user => {
    user.certificates.forEach(cert => {
      certificates.push({
        user: user.name,
        email: user.email,
        courseId: cert.courseId,
        title: cert.title,
        issuedOn: cert.issuedOn,
        certId: cert.certId
      });
    });
  });

  res.json({ certificates });
});

module.exports = router;
