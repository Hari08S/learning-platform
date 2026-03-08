require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./src/config/db');
const corsOptions = require('./src/config/cors');
const { generalLimiter } = require('./src/middleware/rateLimiter');
const errorHandler = require('./src/middleware/errorHandler');
const apiRoutes = require('./src/routes');

const app = express();
const PORT = process.env.PORT || 4000;

// ─────────── Database ───────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upwise';
connectDB(MONGO_URI);

// ─────────── Global Middleware ───────────
app.use(helmet()); // Security headers
app.use(morgan('dev')); // Request logging
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter); // Rate limiting

// ─────────── API Routes ───────────
app.use('/api', apiRoutes);

// ─────────── Health Check ───────────
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    name: 'UpWise API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

// ─────────── 404 Handler ───────────
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ─────────── Error Handler ───────────
app.use(errorHandler);

// ─────────── Start Server ───────────
const server = app.listen(PORT, () => {
  console.log(`\n🚀 UpWise API running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});

// ─────────── Graceful Shutdown ───────────
const shutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
  // Force exit after 10s
  setTimeout(() => process.exit(1), 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
