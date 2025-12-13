const Booking = require('./booking.model');
const BookingLog = require('./bookingLog.model');
const Venue = require('../venues/venue.model');
const User = require('../users/user.model');
const Waitlist = require('./waitlist.model'); // Added for waitlist check
const sendEmail = require('../../utils/emailService');
const { Op } = require('sequelize');

class BookingService {
    async createBooking(bookingData, user) {
        // Check availability
        const existingBooking = await Booking.findOne({
            where: {
                venueId: bookingData.venueId,
                date: bookingData.date,
                [Op.or]: [
                    {
                        startTime: {
                            [Op.between]: [bookingData.startTime, bookingData.endTime]
                        }
                    },
                    {
                        endTime: {
                            [Op.between]: [bookingData.startTime, bookingData.endTime]
                        }
                    }
                ]
            }
        });

        if (existingBooking) {
            throw new Error('Venue is already booked for this time slot');
        }

        const status = bookingData.type === 'academy' ? 'pending-coach' : 'confirmed';

        const booking = await Booking.create({
            ...bookingData,
            userId: user.id,
            status
        });

        // Create Log
        await BookingLog.create({
            bookingId: booking.id,
            userId: user.id,
            action: 'create',
            details: {
                status,
                type: bookingData.type,
                totalPrice: bookingData.totalPrice
            }
        });

        // Send confirmation email
        try {
            const subject = bookingData.type === 'academy' ? 'Academy Booking Received' : 'Booking Confirmation';
            const message = bookingData.type === 'academy'
                ? `Your academy booking request is received. Waiting for coach assignment.`
                : `Your booking at venue ${bookingData.venueId} on ${bookingData.date} is confirmed.`;

            await sendEmail({
                email: user.email,
                subject,
                message
            });
        } catch (err) {
            console.error('Email could not be sent', err);
        }

        return booking;
    }

    async getBookings(options = {}, userId = null) {
        const { limit, offset } = options;
        const where = {};
        if (userId) {
            where.userId = userId;
        }

        return await Booking.findAndCountAll({
            where,
            limit,
            offset,
            include: [
                { model: Venue, attributes: ['name', 'location'] },
                { model: User, attributes: ['name', 'email'] }
            ]
        });
    }

    async getBookingById(id) {
        return await Booking.findByPk(id, {
            include: [
                { model: Venue, attributes: ['name', 'location'] },
                { model: User, attributes: ['name', 'email'] }
            ]
        });
    }

    async getBookingLogs(options = {}) {
        const { limit, offset, bookingId, action, startDate, endDate } = options;
        const where = {};

        if (bookingId) where.bookingId = bookingId;
        if (action) where.action = action;
        if (startDate && endDate) {
            where.timestamp = {
                [Op.between]: [startDate, endDate]
            };
        }

        return await BookingLog.findAndCountAll({
            where,
            limit,
            offset,
            order: [['timestamp', 'DESC']],
            include: [
                { model: User, attributes: ['name', 'email'] },
                { model: Booking, attributes: ['id', 'date', 'startTime'] }
            ]
        });
    }
}

module.exports = new BookingService();
