require('dotenv').config();
const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const coursesRoutes = require('./routes/courses');
const purchasesRoutes = require('./routes/purchases');

const app = express();
const PORT = process.env.PORT || 4000;
// near the top where you import routes
const activityRoutes = require('./routes/activity');
const badgesRoutes = require('./routes/badges');

// after other app.use lines
app.use('/api', activityRoutes);
app.use('/api', badgesRoutes);

// Force use of your URL
const MONGO_URI = "mongodb://localhost:27017/";

connectDB(MONGO_URI);

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api', purchasesRoutes);

app.get('/', (req, res) => res.send('UPWISE API running'));

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error', err);
  res.status(500).json({ message: 'Server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
