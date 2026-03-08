const express = require("express");
const router = express.Router();
const requireAdmin = require("../middleware/requireAdmin");
const User = require("../models/User");
const Course = require("../models/Course");

/* =====================================================
   ADMIN DASHBOARD – SINGLE SOURCE OF TRUTH
===================================================== */
router.get("/dashboard", requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalCourses = await Course.countDocuments();

    const users = await User.find(
      { purchasedCourses: { $exists: true, $ne: [] } },
      { purchasedCourses: 1 }
    ).lean();

    let totalPurchases = 0;
    let totalRevenue = 0;

    users.forEach(user => {
      (user.purchasedCourses || []).forEach(p => {
        // ✅ count ALL purchases
        totalPurchases++;

        // ✅ revenue ONLY active + valid number
        if (p.status === "active") {
          const price = Number(p.price);
          if (!Number.isNaN(price) && price > 0) {
            totalRevenue += price;
          }
        }
      });
    });

    res.json({
      stats: {
        totalUsers,
        totalAdmins,
        totalCourses,
        totalPurchases,
        totalRevenue
      }
    });
  } catch (err) {
    console.error("Admin dashboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   ADMIN PURCHASES – SAME DATA, SAME RULES
===================================================== */
router.get("/purchases", requireAdmin, async (req, res) => {
  try {
    const users = await User.find(
      { purchasedCourses: { $exists: true, $ne: [] } },
      { email: 1, purchasedCourses: 1 }
    ).lean();

    const purchases = [];

    for (const user of users) {
      for (const p of user.purchasedCourses) {
        purchases.push({
          userEmail: user.email,
          courseTitle: p.title || "Course",
          price: Number(p.price) || 0,
          status: p.status || "active",
          purchasedAt: p.purchasedAt || null
        });
      }
    }

    res.json({ purchases });
  } catch (err) {
    console.error("Admin purchases error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   USERS
===================================================== */
router.get("/users", requireAdmin, async (req, res) => {
  const users = await User.find({ role: "user" })
    .select("name email createdAt")
    .lean();
  res.json({ users });
});

router.delete("/users/:id", requireAdmin, async (req, res) => {
  await User.findOneAndDelete({ _id: req.params.id, role: "user" });
  res.json({ success: true });
});

/* =====================================================
   COURSES
===================================================== */
router.get("/courses", requireAdmin, async (req, res) => {
  const courses = await Course.find({}).lean();
  res.json({ courses });
});

router.post("/courses", requireAdmin, async (req, res) => {
  const course = await Course.create(req.body);
  res.status(201).json({ course });
});

router.put("/courses/:id", requireAdmin, async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true
  });
  res.json({ course });
});

router.delete("/courses/:id", requireAdmin, async (req, res) => {
  await Course.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
