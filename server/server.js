// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// require routes (only require modules here — mount after app created)
const authRoutes = require('./routes/auth');
const coursesRoutes = require('./routes/courses');
const purchasesRoutes = require('./routes/purchases');
const activityRoutes = require('./routes/activity');
const badgesRoutes = require('./routes/badges');
const lessonsRoutes = require('./routes/lessons');

const quizzesRouter = require('./routes/quizzes'); // GET metadata (if exists)
const quizRoutes = require('./routes/quiz');       // POST submit
const progressRoutes = require('./routes/progress');

// New certificates route (ensure file exists at server/routes/certificates.js)
let certificatesRoutes;
try {
  certificatesRoutes = require('./routes/certificates');
} catch (e) {
  // If file missing, keep app running and log a warning
  console.warn('Warning: certificates route not found (server/routes/certificates.js). Certificate endpoints disabled.');
  certificatesRoutes = null;
}

const app = express();
const PORT = process.env.PORT || 4000;

// connect DB
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/upwise";
connectDB(MONGO_URI);

// Middleware (JSON + CORS)
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// Mount routes.
// Keep auth/courses/purchases/lessons mounted under /api or /api/auth etc.
app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);

// purchases & other /api endpoints
app.use('/api', purchasesRoutes);
app.use('/api', lessonsRoutes);

// quizzes (metadata) first
app.use('/api/quizzes', quizzesRouter);

// quiz submit and related endpoints (POST /api/me/quiz/:courseId etc.)
app.use('/api', quizRoutes);

// progress routes (GET /api/me/progress and refresh)
app.use('/api/me', progressRoutes);

// activity / badges
app.use('/api', activityRoutes);
app.use('/api', badgesRoutes);

// mount certificates routes under /api/me if available
if (certificatesRoutes) {
  app.use('/api/me', certificatesRoutes);
}

// Health check
app.get('/', (req, res) => res.send('UPWISE API running'));

// Error handler (fallback)
app.use((err, req, res, next) => {
  console.error('Server error', err);
  res.status(500).json({ message: 'Server error' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
