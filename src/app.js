const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const i18n = require('./middleware/i18n');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

// Route imports
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const venueRoutes = require('./modules/venues/venue.routes');
const bookingRoutes = require('./modules/bookings/booking.routes');
const chatRoutes = require('./modules/chat/chat.routes');
const settingsRoutes = require('./modules/settings/settings.routes');
const sportRoutes = require('./modules/sports/sport.routes');
const coachRoutes = require('./modules/coaches/coach.routes');
const matchRoutes = require('./modules/matches/match.routes');
const offerRoutes = require('./modules/offers/offer.routes');
const storyRoutes = require('./modules/stories/story.routes');
const notificationRoutes = require('./modules/notifications/notification.routes');

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(rateLimit);
app.use(i18n);

// Body parser
app.use(express.json());

// Logging Middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Swagger Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Mount Routes
const API_BASE = process.env.API_BASE || '/api/v1';
app.use(`${API_BASE}/auth`, authRoutes);
app.use(`${API_BASE}/users`, userRoutes);
app.use(`${API_BASE}/venues`, venueRoutes);
app.use(`${API_BASE}/bookings`, bookingRoutes);
app.use(`${API_BASE}/chat`, chatRoutes);
app.use(`${API_BASE}/settings`, settingsRoutes);
app.use(`${API_BASE}/sports`, sportRoutes);
app.use(`${API_BASE}/coaches`, coachRoutes);
app.use(`${API_BASE}/matches`, matchRoutes);
app.use(`${API_BASE}/offers`, offerRoutes);
app.use(`${API_BASE}/stories`, storyRoutes);
app.use(`${API_BASE}/notifications`, notificationRoutes);

// Error Handler
app.use(errorHandler);

module.exports = app;
