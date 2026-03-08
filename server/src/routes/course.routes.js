// server/src/routes/course.routes.js
const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const validate = require('../middleware/validate');
const { courseSearchQuery } = require('../validators/course.validator');
const { parsePagination } = require('../utils/helpers');

/**
 * GET /api/courses
 * List all courses with search, filter, sort, and pagination
 */
router.get('/', courseSearchQuery, validate, async (req, res, next) => {
    try {
        const { search, level, tag, sort } = req.query;
        const { page, limit, skip } = parsePagination(req.query);

        // Build filter
        const filter = { isPublished: { $ne: false } };

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { author: { $regex: search, $options: 'i' } },
            ];
        }

        if (level) filter.level = level;
        if (tag) filter.tag = tag;

        // Build sort
        let sortObj = { createdAt: -1 }; // default: newest first
        if (sort === 'oldest') sortObj = { createdAt: 1 };
        else if (sort === 'price_asc') sortObj = { priceNumber: 1 };
        else if (sort === 'price_desc') sortObj = { priceNumber: -1 };
        else if (sort === 'rating') sortObj = { rating: -1 };
        else if (sort === 'popular') sortObj = { students: -1 };

        const [courses, total] = await Promise.all([
            Course.find(filter).sort(sortObj).skip(skip).limit(limit).lean(),
            Course.countDocuments(filter),
        ]);

        return res.json({
            courses,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/courses/:id
 * Course detail
 */
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const mongoose = require('mongoose');

        let course = null;
        if (mongoose.Types.ObjectId.isValid(id)) {
            course = await Course.findById(id).lean();
        } else {
            const numId = parseInt(id, 10);
            if (!isNaN(numId)) {
                course = await Course.findOne({ legacyId: numId }).lean();
            }
        }

        if (!course) return res.status(404).json({ message: 'Course not found' });
        return res.json({ course });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
