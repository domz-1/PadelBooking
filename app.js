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
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/venues', venueRoutes);
app.use('/api/v1/settings', settingsRoutes);

// Error Handler
app.use(errorHandler);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

module.exports = app; 