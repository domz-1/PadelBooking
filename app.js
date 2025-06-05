const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('./middleware/rateLimiter');
const { errorHandler } = require('./utils/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const venueRoutes = require('./routes/venueRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();
const API_BASE = process.env.API_BASE || '/api/v1';

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(rateLimit);

// Body parser
app.use(express.json());

// Logging Middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Mount Routes
app.use(`${API_BASE}/auth`, authRoutes);
app.use(`${API_BASE}/bookings`, bookingRoutes);
app.use(`${API_BASE}/venues`, venueRoutes);
app.use(`${API_BASE}/settings`, settingsRoutes);

// Error Handler
app.use(errorHandler);

// Handle invalid API routes
app.use('/api/*', (req, res) => {
    console.log('Invalid API route accessed:', req.method, req.url);
    res.status(404).json({
        success: false,
        message: 'Invalid API route'
    });
});

// Handle all other routes
app.use('*', (req, res) => {
    console.log('Route not found:', req.method, req.url);
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

module.exports = app;
