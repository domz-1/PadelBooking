const bookingService = require('./booking.service');

exports.getBookings = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // If admin, get all or filter by query. If user, get own.
        let userId = req.user.id;
        if (req.user.role === 'admin') {
            userId = req.query.userId || null;
        }

        const { date } = req.query;

        const { count, rows } = await bookingService.getBookings({ limit, offset, date }, userId);

        res.status(200).json({
            success: true,
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            data: rows
        });
    } catch (error) {
        next(error);
    }
};

exports.getBooking = async (req, res, next) => {
    try {
        const booking = await bookingService.getBookingById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Make sure user owns booking or is admin
        if (booking.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        next(error);
    }
};

exports.createBooking = async (req, res, next) => {
    try {
        const booking = await bookingService.createBooking(req.body, req.user);

        // Notify all clients about new booking
        req.app.get('io').emit('bookingUpdate', { type: 'create', data: booking });

        res.status(201).json({ success: true, data: booking });
    } catch (error) {
        console.error('Create Booking Error:', error);
        next(error);
    }
};

exports.getMyBookings = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await bookingService.getBookings({ limit, offset }, req.user.id);

        res.status(200).json({
            success: true,
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            data: rows
        });
    } catch (error) {
        next(error);
    }
};

exports.getBookingLogs = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { bookingId, action, startDate, endDate } = req.query;

        const { count, rows } = await bookingService.getBookingLogs({
            limit,
            offset,
            bookingId,
            action,
            startDate,
            endDate
        });

        res.status(200).json({
            success: true,
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            data: rows
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get daily booking summary
// @route   GET /api/v1/bookings/daily-summary
// @access  Private (Admin)
exports.getDailySummary = async (req, res, next) => {
    try {
        const { Op } = require('sequelize');
        const Booking = require('./booking.model');

        // Start: Today 12:00 PM
        const start = new Date();
        start.setHours(12, 0, 0, 0);

        // End: Tomorrow 05:00 AM
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        end.setHours(5, 0, 0, 0);

        const todayDate = start.toISOString().split('T')[0];
        const tomorrowDate = end.toISOString().split('T')[0];

        const bookingsInRange = await Booking.findAll({
            where: {
                [Op.or]: [
                    {
                        date: todayDate,
                        startTime: { [Op.gte]: '12:00:00' }
                    },
                    {
                        date: tomorrowDate,
                        startTime: { [Op.lt]: '05:00:00' }
                    }
                ]
            }
        });

        let totalBookings = bookingsInRange.length;
        let noShowCount = 0;
        let expectedRevenue = 0;
        let actualRevenue = 0;

        bookingsInRange.forEach(booking => {
            if (booking.status === 'no-show') {
                noShowCount++;
            }

            if (booking.status !== 'cancelled') {
                expectedRevenue += booking.totalPrice;
            }

            if (booking.status === 'confirmed') {
                actualRevenue += booking.totalPrice;
            }
        });

        res.status(200).json({
            success: true,
            data: {
                date: todayDate,
                window: {
                    start: `${todayDate} 12:00 PM`,
                    end: `${tomorrowDate} 05:00 AM`
                },
                metrics: {
                    totalBookings,
                    noShowCount,
                    expectedRevenue,
                    actualRevenue
                },
                bookings: bookingsInRange
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.updateBooking = async (req, res, next) => {
    try {
        let booking = await bookingService.getBookingById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Make sure user owns booking or is admin
        if (booking.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        booking = await bookingService.updateBooking(req.params.id, req.body, req.user);

        // Notify all clients about updated booking
        req.app.get('io').emit('bookingUpdate', { type: 'update', data: booking });

        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        next(error);
    }
};

exports.deleteBooking = async (req, res, next) => {
    try {
        const { seriesOption = 'single' } = req.query;
        await bookingService.deleteBooking(req.params.id, req.user, seriesOption);

        // Notify all clients about deleted booking
        req.app.get('io').emit('bookingUpdate', { type: 'delete', id: req.params.id });

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};

exports.convertToOpenMatch = async (req, res, next) => {
    try {
        const { maxPlayers = 4 } = req.body;
        const booking = await bookingService.convertToOpenMatch(req.params.id, req.user.id, maxPlayers);

        // Notify all clients about updated booking
        req.app.get('io').emit('bookingUpdate', { type: 'update', data: booking });

        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        next(error);
    }
};

exports.joinOpenMatch = async (req, res, next) => {
    try {
        const booking = await bookingService.joinOpenMatch(req.params.id, req.user.id);

        // Notify all clients about updated booking
        req.app.get('io').emit('bookingUpdate', { type: 'update', data: booking });

        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        next(error);
    }
};

exports.leaveOpenMatch = async (req, res, next) => {
    try {
        const booking = await bookingService.leaveOpenMatch(req.params.id, req.user.id);

        // Notify all clients about updated booking
        req.app.get('io').emit('bookingUpdate', { type: 'update', data: booking });

        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        next(error);
    }
};

exports.getOpenMatches = async (req, res, next) => {
    try {
        const { date } = req.query;
        const bookings = await bookingService.getOpenMatches(date);

        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        next(error);
    }
};
