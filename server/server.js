// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');

// core routes
const authRoutes = require('./routes/auth');
const coursesRoutes = require('./routes/courses');
const purchasesRoutes = require('./routes/purchases');
const activityRoutes = require('./routes/activity');
const badgesRoutes = require('./routes/badges');

// lessons + quiz routes (ensure these files exist)
const lessonsRoutes = require('./routes/lessons');
const quizRoutes = require('./routes/quiz');

const app = express();
const PORT = process.env.PORT || 4000;

// DB (use env MONGO_URI if set)
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/";
connectDB(MONGO_URI);

// Middleware
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// Mount routes (clear order)
app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);

// purchases and progress endpoints
app.use('/api', purchasesRoutes);

// lessons & quiz endpoints (requireAuth inside route files)
app.use('/api', lessonsRoutes);
app.use('/api', quizRoutes);

// optional activity/badges
app.use('/api', activityRoutes);
app.use('/api', badgesRoutes);

// health
app.get('/', (req, res) => res.send('UPWISE API running'));

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error', err);
  res.status(500).json({ message: 'Server error' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
