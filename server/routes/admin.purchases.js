const express = require("express");
const router = express.Router();
const requireAdmin = require("../middleware/requireAdmin");
const User = require("../models/User");
const Course = require("../models/Course");

router.get("/purchases", requireAdmin, async (req, res) => {
  try {
    const users = await User.find(
      { purchasedCourses: { $exists: true, $ne: [] } },
      { email: 1, purchasedCourses: 1 }
    ).lean();

    const allPurchases = [];

    for (const user of users) {
      for (const p of user.purchasedCourses) {
        let courseTitle = p.title || "Course";

        // Try to resolve course title if courseId exists
        if (p.courseId) {
          try {
            const course = await Course.findById(p.courseId).select("title").lean();
            if (course?.title) courseTitle = course.title;
          } catch {}
        }

        allPurchases.push({
          userEmail: user.email,
          courseTitle,
          price: p.price ?? 0,
          status: p.status ?? "active",
          purchasedAt: p.purchasedAt ?? null,
        });
      }
    }

    res.json({ purchases: allPurchases });
  } catch (err) {
    console.error("Admin purchases error", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
