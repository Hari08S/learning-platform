// server/src/middleware/errorHandler.js

/**
 * Centralized error handler middleware.
 * Must be registered LAST with app.use().
 * Catches all unhandled errors and returns a clean JSON response.
 */
function errorHandler(err, req, res, next) {
    // Log the error
    console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message || err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({ message: 'Validation error', errors: messages });
    }

    // Mongoose cast error (invalid ObjectId, etc.)
    if (err.name === 'CastError') {
        return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {}).join(', ');
        return res.status(409).json({ message: `Duplicate value for: ${field}` });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
    }

    // CORS error
    if (err.message && err.message.includes('CORS')) {
        return res.status(403).json({ message: 'CORS policy violation' });
    }

    // Default server error
    const statusCode = err.statusCode || 500;
    const message = statusCode === 500 ? 'Internal server error' : err.message;

    return res.status(statusCode).json({ message });
}

module.exports = errorHandler;
