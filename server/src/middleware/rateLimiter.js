// server/src/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');
const {
    AUTH_RATE_LIMIT_WINDOW_MS,
    AUTH_RATE_LIMIT_MAX,
    GENERAL_RATE_LIMIT_WINDOW_MS,
    GENERAL_RATE_LIMIT_MAX,
} = require('../config/constants');

/**
 * Rate limiter for auth endpoints (login, signup)
 * Prevents brute-force attacks
 */
const authLimiter = rateLimit({
    windowMs: AUTH_RATE_LIMIT_WINDOW_MS,
    max: AUTH_RATE_LIMIT_MAX,
    message: { message: 'Too many attempts. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * General rate limiter for all API endpoints
 */
const generalLimiter = rateLimit({
    windowMs: GENERAL_RATE_LIMIT_WINDOW_MS,
    max: GENERAL_RATE_LIMIT_MAX,
    message: { message: 'Too many requests. Please slow down.' },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { authLimiter, generalLimiter };
