// server/src/validators/course.validator.js
const { body, param, query } = require('express-validator');

const createCourseRules = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ max: 200 }).withMessage('Title must be at most 200 characters'),
    body('author')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Author must be at most 100 characters'),
    body('price')
        .optional(),
    body('priceNumber')
        .optional()
        .isNumeric().withMessage('Price must be a number'),
    body('level')
        .optional()
        .isIn(['Beginner', 'Intermediate', 'Advanced', 'All Levels']).withMessage('Invalid level'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 5000 }).withMessage('Description too long'),
];

const courseIdParam = [
    param('id')
        .notEmpty().withMessage('Course ID is required')
        .isMongoId().withMessage('Invalid course ID format'),
];

const courseSearchQuery = [
    query('search')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('Search query too long'),
    query('level')
        .optional()
        .isIn(['Beginner', 'Intermediate', 'Advanced', 'All Levels']).withMessage('Invalid level'),
    query('tag')
        .optional()
        .trim(),
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
    query('sort')
        .optional()
        .isIn(['newest', 'oldest', 'price_asc', 'price_desc', 'rating', 'popular']).withMessage('Invalid sort option'),
];

module.exports = { createCourseRules, courseIdParam, courseSearchQuery };
