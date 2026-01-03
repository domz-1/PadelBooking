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

// Admin Route Imports
const adminUserRoutes = require('./modules/users/users.admin.routes');
const adminVenueRoutes = require('./modules/venues/venues.admin.routes');
const adminBookingRoutes = require('./modules/bookings/bookings.admin.routes');
const adminSettingsRoutes = require('./modules/settings/settings.admin.routes');
const adminSportRoutes = require('./modules/sports/sports.admin.routes');
const adminNotificationRoutes = require('./modules/notifications/notifications.admin.routes');
const adminStoreRoutes = require('./modules/store/store.admin.routes');
const adminSponsorRoutes = require('./modules/sponsors/sponsors.admin.routes');
const adminOfferRoutes = require('./modules/offers/offers.admin.routes');
const adminCoachRoutes = require('./modules/coaches/coaches.admin.routes'); // NEW
const adminMatchRoutes = require('./modules/matches/matches.admin.routes'); // NEW
const adminStoryRoutes = require('./modules/stories/stories.admin.routes'); // NEW
const adminBranchRoutes = require('./modules/branches/branches.admin.routes'); // NEW
const adminMetricsRoutes = require('./modules/metrics/metrics.routes'); // NEW

// Client Route Imports
const clientAuthRoutes = require('./modules/auth/auth.client.routes');
const clientUserRoutes = require('./modules/users/users.client.routes');
const clientVenueRoutes = require('./modules/venues/venues.client.routes');
const clientBookingRoutes = require('./modules/bookings/bookings.client.routes');
const clientChatRoutes = require('./modules/chat/chat.client.routes');
const clientSettingsRoutes = require('./modules/settings/settings.client.routes');
const clientSportRoutes = require('./modules/sports/sports.client.routes');
const clientCoachRoutes = require('./modules/coaches/coaches.client.routes');
const clientMatchRoutes = require('./modules/matches/matches.client.routes');
const clientOfferRoutes = require('./modules/offers/offers.client.routes');
const clientStoryRoutes = require('./modules/stories/stories.client.routes');
const clientNotificationRoutes = require('./modules/notifications/notifications.client.routes');
const clientStoreRoutes = require('./modules/store/store.client.routes');
const clientSponsorRoutes = require('./modules/sponsors/sponsors.client.routes');
const clientBranchRoutes = require('./modules/branches/branches.client.routes');

const app = express();

// Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
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

// --- ADMIN ROUTES ---
const adminRouter = express.Router();
adminRouter.use('/users', adminUserRoutes);
adminRouter.use('/venues', adminVenueRoutes);
adminRouter.use('/bookings', adminBookingRoutes);
adminRouter.use('/settings', adminSettingsRoutes);
adminRouter.use('/sports', adminSportRoutes);
adminRouter.use('/notifications', adminNotificationRoutes);
adminRouter.use('/store', adminStoreRoutes);
adminRouter.use('/sponsors', adminSponsorRoutes);
adminRouter.use('/offers', adminOfferRoutes);
adminRouter.use('/coaches', adminCoachRoutes); // NEW
adminRouter.use('/matches', adminMatchRoutes); // NEW
adminRouter.use('/stories', adminStoryRoutes); // NEW
adminRouter.use('/branches', adminBranchRoutes); // NEW
adminRouter.use('/metrics', adminMetricsRoutes); // NEW

app.use('/admin', adminRouter);

// --- CLIENT ROUTES ---
const clientRouter = express.Router();
clientRouter.use('/auth', clientAuthRoutes);
clientRouter.use('/users', clientUserRoutes);
clientRouter.use('/venues', clientVenueRoutes);
clientRouter.use('/bookings', clientBookingRoutes);
clientRouter.use('/chat', clientChatRoutes);
clientRouter.use('/settings', clientSettingsRoutes);
clientRouter.use('/sports', clientSportRoutes);
clientRouter.use('/coaches', clientCoachRoutes);
clientRouter.use('/matches', clientMatchRoutes);
clientRouter.use('/offers', clientOfferRoutes);
clientRouter.use('/stories', clientStoryRoutes);
clientRouter.use('/notifications', clientNotificationRoutes);
clientRouter.use('/store', clientStoreRoutes);
clientRouter.use('/sponsors', clientSponsorRoutes);
clientRouter.use('/branches', clientBranchRoutes);

app.use('/api', clientRouter);

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Handle SPA
app.get(/.*/, (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/admin')) {
        return next();
    }
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error Handler
app.use(errorHandler);

module.exports = app;
