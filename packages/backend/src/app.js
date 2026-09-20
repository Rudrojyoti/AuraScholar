const express = require('express');
const cors = require('cors');
const { clerkInit } = require('./middleware/authMiddleware');
const healthRoutes = require('./routes/healthRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const queryRoutes = require('./routes/queryRoutes');
const paperRoutes = require('./routes/paperRoutes');

const app = express();

// CORS — allow frontend dev server and production domain
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Clerk — populate req.auth on every request (no-op if no token present)
app.use(clerkInit);

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ask', queryRoutes);
app.use('/api/papers', paperRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error'
  });
});

module.exports = app;
