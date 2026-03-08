// server/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const requireAuth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const { signupRules, loginRules, changePasswordRules, updateProfileRules } = require('../validators/auth.validator');
const { JWT_SECRET, TOKEN_EXPIRES, BCRYPT_SALT_ROUNDS } = require('../config/constants');

/**
 * POST /api/auth/signup
 */
router.post('/signup', authLimiter, signupRules, validate, async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(409).json({ message: 'User already exists with this email' });
        }

        const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

        const user = new User({
            name: name.trim(),
            email: email.toLowerCase(),
            passwordHash,
        });

        await user.save();

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: TOKEN_EXPIRES }
        );

        res.status(201).json({
            user: {
                id: String(user._id),
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token,
        });
    } catch (err) {
        next(err);
    }
});

/**
 * POST /api/auth/login
 */
router.post('/login', authLimiter, loginRules, validate, async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: TOKEN_EXPIRES }
        );

        res.json({
            user: {
                id: String(user._id),
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar || null,
            },
            token,
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/auth/me
 */
router.get('/me', requireAuth, async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).lean();
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({
            user: {
                id: String(user._id),
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar || null,
                bio: user.bio || '',
                createdAt: user.createdAt,
            },
        });
    } catch (err) {
        next(err);
    }
});

/**
 * PUT /api/auth/profile
 * Update user's own profile (name, bio)
 */
router.put('/profile', requireAuth, updateProfileRules, validate, async (req, res, next) => {
    try {
        const { name, bio } = req.body;
        const updates = {};
        if (name !== undefined) updates.name = name.trim();
        if (bio !== undefined) updates.bio = bio.trim();

        const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).lean();
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({
            user: {
                id: String(user._id),
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar || null,
                bio: user.bio || '',
            },
        });
    } catch (err) {
        next(err);
    }
});

/**
 * PUT /api/auth/change-password
 * Change password for logged-in user
 */
router.put('/change-password', requireAuth, changePasswordRules, validate, async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const ok = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!ok) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
