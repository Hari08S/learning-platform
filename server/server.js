// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// require routes
const authRoutes = require('./routes/auth');
const coursesRoutes = require('./routes/courses');
const purchasesRoutes = require('./routes/purchases');
const activityRoutes = require('./routes/activity');
const badgesRoutes = require('./routes/badges');
const lessonsRoutes = require('./routes/lessons');

const quizzesRouter = require('./routes/quizzes');
const quizRoutes = require('./routes/quiz');
const progressRoutes = require('./routes/progress');

// certificates route (optional)
let certificatesRoutes;
try {
  certificatesRoutes = require('./routes/certificates');
} catch (e) {
  console.warn('Warning: certificates route not found (server/routes/certificates.js). Certificate endpoints disabled.');
  certificatesRoutes = null;
}

const app = express();
const PORT = process.env.PORT || 4000;

// connect DB
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/upwise";
connectDB(MONGO_URI);

// -----------------------------
// 🔥 FIXED CORS CONFIG
// -----------------------------
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",  // your frontend in screenshot
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);  // allow Postman/curl
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.log("❌ Blocked by CORS:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

// JSON parser
app.use(express.json());

// -----------------------------
// Routes
// -----------------------------
app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);

app.use('/api', purchasesRoutes);
app.use('/api', lessonsRoutes);

app.use('/api/quizzes', quizzesRouter);

app.use('/api', quizRoutes);

app.use('/api/me', progressRoutes);

app.use('/api', activityRoutes);
app.use('/api', badgesRoutes);

if (certificatesRoutes) {
  app.use('/api/me', certificatesRoutes);
}

// Health check
app.get('/', (req, res) => res.send('UPWISE API running'));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error', err);
  res.status(500).json({ message: 'Server error' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
