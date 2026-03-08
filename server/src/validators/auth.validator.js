// server/src/validators/auth.validator.js
const { body } = require('express-validator');
const { MIN_PASSWORD_LENGTH } = require('../config/constants');

const signupRules = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ max: 100 }).withMessage('Name must be at most 100 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Must be a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: MIN_PASSWORD_LENGTH }).withMessage(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`),
];

const loginRules = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Must be a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required'),
];

const changePasswordRules = [
    body('currentPassword')
        .notEmpty().withMessage('Current password is required'),
    body('newPassword')
        .notEmpty().withMessage('New password is required')
        .isLength({ min: MIN_PASSWORD_LENGTH }).withMessage(`New password must be at least ${MIN_PASSWORD_LENGTH} characters`),
];

const updateProfileRules = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
    body('bio')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Bio must be at most 500 characters'),
];

module.exports = { signupRules, loginRules, changePasswordRules, updateProfileRules };
