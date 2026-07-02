require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const errorHandler = require('./middleware/errorHandler');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const timeLogRoutes = require('./routes/timeLogRoutes');
const payslipRoutes = require('./routes/payslipRoutes');
const syncRoutes = require('./routes/syncRoutes');
const { startSyncScheduler } = require('./jobs/syncScheduler');

const app = express();
const PORT = process.env.PORT || 5000;

// Production runs behind a platform load balancer (Render/Railway/etc.) —
// trust the first hop so req.ip and rate limiting see the real client IP.
// Harmless locally (no proxy involved).
app.set('trust proxy', 1);

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({ 
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }, 
  credentials: true 
}));
app.use(express.json());
app.use(mongoSanitize());

// Brute-force protection on auth endpoints (login/register)
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later' },
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/timelogs', timeLogRoutes);
app.use('/api/payslips', payslipRoutes);
app.use('/api/sync', syncRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('Timesheet Tracker API is running securely!');
});

// Global error handler — must be registered after all routes
app.use(errorHandler);

// Background Humanforce ICS sync (every 15 min)
startSyncScheduler();

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
