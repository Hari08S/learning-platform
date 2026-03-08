const router = require("express").Router();
const requireAdmin = require("../middleware/requireAdmin");
const User = require("../models/User");

router.put("/", requireAdmin, async (req, res) => {
  const admin = await User.findById(req.user.id);
  admin.name = req.body.name;
  await admin.save();

  res.json({
    user: {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  });
});

module.exports = router;
