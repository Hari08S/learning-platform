const express = require("express");
const router = express.Router();
const requireAdmin = require("../middleware/requireAdmin");
const User = require("../models/User");
const Course = require("../models/Course");

/*
=====================================================
ADMIN DASHBOARD
- SINGLE SOURCE OF TRUTH: User.purchasedCourses
- ACTIVE = status !== "cancelled"
- Revenue = sum of ACTIVE purchases only
=====================================================
*/
router.get("/dashboard", requireAdmin, async (req, res) => {
  try {
    /* ===== BASIC COUNTS ===== */
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalCourses = await Course.countDocuments();

    /* ===== PURCHASES & REVENUE ===== */
    const users = await User.find(
      { purchasedCourses: { $exists: true, $ne: [] } },
      { purchasedCourses: 1 }
    ).lean();

    let totalPurchases = 0;
    let totalRevenue = 0;

    users.forEach(user => {
      (user.purchasedCourses || []).forEach(p => {
        // ✅ Count EVERY purchase (active + cancelled)
        totalPurchases++;

        // ✅ ACTIVE unless explicitly cancelled
        const isActive = p.status !== "cancelled";

        if (isActive) {
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

module.exports = router;
