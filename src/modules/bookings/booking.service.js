const Booking = require('./booking.model');
const Venue = require('../venues/venue.model');
const User = require('../users/user.model');
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
}

module.exports = new BookingService();
