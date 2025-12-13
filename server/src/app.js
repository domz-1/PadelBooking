const express = require('express');
const path = require('path');
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
const storeRoutes = require('./modules/store/store.routes');
const sponsorRoutes = require('./modules/sponsors/sponsor.routes');

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

// Mount routers
app.use(`${process.env.API_BASE}/auth`, authRoutes);
app.use(`${process.env.API_BASE}/users`, userRoutes);
app.use(`${process.env.API_BASE}/venues`, venueRoutes);
app.use(`${process.env.API_BASE}/bookings`, bookingRoutes);
app.use(`${process.env.API_BASE}/chat`, chatRoutes);
app.use(`${process.env.API_BASE}/settings`, settingsRoutes);
app.use(`${process.env.API_BASE}/sports`, sportRoutes);
app.use(`${process.env.API_BASE}/coaches`, coachRoutes);
app.use(`${process.env.API_BASE}/matches`, matchRoutes);
app.use(`${process.env.API_BASE}/offers`, offerRoutes);
app.use(`${process.env.API_BASE}/stories`, storyRoutes);
app.use(`${process.env.API_BASE}/notifications`, notificationRoutes);
app.use(`${process.env.API_BASE}/store`, storeRoutes);
app.use(`${process.env.API_BASE}/sponsors`, sponsorRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Handle SPA
app.get(/.*/, (req, res, next) => {
    if (req.originalUrl.startsWith(process.env.API_BASE)) {
        return next();
    }
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error Handler
app.use(errorHandler);

module.exports = app;
