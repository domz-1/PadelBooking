const bookingService = require('../../../common/services/booking.service');


exports.getBookings = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { date, startDate, endDate, userId: userIdFromQuery } = req.query;
        const options = { limit, offset, date, startDate, endDate };

        // If query has userId and user is admin, pass it to options
        if (req.user && req.user.role === 'admin' && userIdFromQuery) {
            options.userId = userIdFromQuery;
        }

        const { count, rows } = await bookingService.getBookings(options, req.user);

        // For public requests, simplify the response format
        if (req.user && req.user.role === 'public') {
            res.status(200).json({
                success: true,
                count,
                data: rows
            });
        } else {
            res.status(200).json({
                success: true,
                count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                data: rows
            });
        }
    } catch (error) {
        next(error);
    }
};

// Public endpoint for non-authenticated users
exports.getPublicBookings = async (req, res, next) => {
    try {
        const { date } = req.query;

        // Date is required for public access
        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date parameter is required'
            });
        }

        // Create a mock public user
        const publicUser = {
            id: 0,
            role: 'public',
            name: 'Public User',
            email: 'public@example.com'
        };

        const options = {
            date,
            limit: 100
        };

        const { count, rows } = await bookingService.getBookings(options, publicUser);

        res.status(200).json({
            success: true,
            count,
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
        const result = await bookingService.createBooking(req.body, req.user);

        // Notify all clients about new booking(s)
        if (Array.isArray(result)) {
            result.forEach(b => {
                req.app.get('io').emit('bookingUpdate', { type: 'create', data: b });
            });
        } else {
            req.app.get('io').emit('bookingUpdate', { type: 'create', data: result });
        }

        res.status(201).json({ success: true, data: result });
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

        const { count, rows } = await bookingService.getBookings({ limit, offset }, req.user);

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
        const Booking = require('../../../common/services/booking.model');

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

        const result = await bookingService.updateBooking(req.params.id, req.body, req.user);

        // Notify all clients about updated booking(s)
        if (Array.isArray(result)) {
            result.forEach(b => {
                req.app.get('io').emit('bookingUpdate', { type: 'update', data: b });
            });
        } else {
            req.app.get('io').emit('bookingUpdate', { type: 'update', data: result });
        }

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

exports.deleteBooking = async (req, res, next) => {
    try {
        const { seriesOption = 'single' } = req.query;
        const deletedIds = await bookingService.deleteBooking(req.params.id, req.user, seriesOption);

        // Notify all clients about deleted booking(s)
        if (Array.isArray(deletedIds)) {
            deletedIds.forEach(id => {
                req.app.get('io').emit('bookingUpdate', { type: 'delete', id });
            });
        } else {
            req.app.get('io').emit('bookingUpdate', { type: 'delete', id: req.params.id });
        }

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
const skeddaService = require('../../../common/services/skedda.service');

exports.getFreeSlots = async (req, res, next) => {
    try {
        const { startDate, startTime, endDate, endTime, branchId } = req.query;
        if (!startDate || !startTime || !endDate || !endTime) {
            return res.status(400).json({ success: false, message: 'Missing required range parameters' });
        }

        const data = await bookingService.getFreeSlots({
            startDate,
            startTime,
            endDate,
            endTime,
            branchId: branchId || 'all'
        });

        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

exports.syncSkedda = async (req, res, next) => {
    try {
        const { start, end } = req.body;
        const result = await skeddaService.syncBookings(start, end);

        // Notify admins or logs if needed
        res.status(200).json({
            success: true,
            message: `Skedda sync completed. Synced: ${result.synced}, Errors: ${result.errors}`,
            data: result
        });
    } catch (error) {
        console.error('Skedda Sync Error:', error);
        if (error.response && error.response.data) {
            return res.status(error.response.status || 500).json({
                success: false,
                message: 'Skedda API Error',
                error: error.response.data,
                headers: error.response.headers
            });
        }
        next(error);
    }
};
