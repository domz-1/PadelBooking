const Booking = require('./booking.model');
const BookingLog = require('./bookingLog.model');
const Venue = require('../venues/venue.model');
const User = require('../users/user.model');
const Order = require('../store/order.model');
const Waitlist = require('./waitlist.model');
const sendEmail = require('../../utils/emailService');
const Branch = require('../branches/branch.model');
const { Op } = require('sequelize');

class BookingService {
    // ... existing methods ...

    // ...

    async getBookings(options = {}, userId = null) {
        const { limit, offset, date } = options;
        const where = {};
        if (userId) {
            where.userId = userId;
        }
        if (date) {
            where.date = date;
        }

        return await Booking.findAndCountAll({
            where,
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: Venue,
                    attributes: ['name', 'location'],
                    include: [{ model: Branch, attributes: ['name', 'location'] }]
                },
                { model: User, attributes: ['name', 'email'] }
            ]
        });
    }

    async getBookingById(id) {
        return await Booking.findByPk(id, {
            include: [
                {
                    model: Venue,
                    attributes: ['name', 'location'],
                    include: [{ model: Branch, attributes: ['name', 'location'] }]
                },
                { model: User, attributes: ['name', 'email'] }
            ]
        });
    }


    async createBooking(bookingData, user) {
        if (bookingData.categoryId === '') bookingData.categoryId = null;

        // Check availability
        const existingBooking = await Booking.findOne({
            where: {
                venueId: bookingData.venueId,
                date: bookingData.date,
                [Op.and]: [
                    { startTime: { [Op.lt]: bookingData.endTime } },
                    { endTime: { [Op.gt]: bookingData.startTime } }
                ]
            }
        });

        if (existingBooking) {
            throw new Error('Venue is already booked for this time slot');
        }

        // Calculate Total Price if not provided
        if (!bookingData.totalPrice) {
            const venue = await Venue.findByPk(bookingData.venueId);
            if (!venue) {
                throw new Error('Venue not found');
            }

            const start = new Date(`1970-01-01T${bookingData.startTime}Z`);
            const end = new Date(`1970-01-01T${bookingData.endTime}Z`);
            const durationHours = (end - start) / (1000 * 60 * 60);

            if (durationHours <= 0) {
                throw new Error('Invalid time range');
            }

            bookingData.totalPrice = venue.pricePerHour * durationHours;
        }

        const status = bookingData.type === 'academy' ? 'pending-coach' : 'confirmed';

        // Determine userId: if admin and userId provided in data, use it; otherwise use logged-in user
        const userId = (user.role === 'admin' && bookingData.userId) ? bookingData.userId : user.id;

        const booking = await Booking.create({
            ...bookingData,
            userId,
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

            sendEmail({
                email: user.email,
                subject,
                message
            }).catch(err => console.error('Email could not be sent', err));
        } catch (err) {
            console.error('Error preparing email', err);
        }

        return booking;
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

    async updateBooking(id, updateData, user) {
        if (updateData.categoryId === '') updateData.categoryId = null;

        const booking = await this.getBookingById(id);
        if (!booking) {
            throw new Error('Booking not found');
        }

        // Check availability if time or venue is changing
        if (
            (updateData.date && updateData.date !== booking.date) ||
            (updateData.startTime && updateData.startTime !== booking.startTime) ||
            (updateData.endTime && updateData.endTime !== booking.endTime) ||
            (updateData.venueId && updateData.venueId !== booking.venueId)
        ) {
            const checkDate = updateData.date || booking.date;
            const checkStartTime = updateData.startTime || booking.startTime;
            const checkEndTime = updateData.endTime || booking.endTime;
            const checkVenueId = updateData.venueId || booking.venueId;

            const existingBooking = await Booking.findOne({
                where: {
                    venueId: checkVenueId,
                    date: checkDate,
                    id: { [Op.ne]: parseInt(id) }, // Exclude current booking
                    [Op.and]: [
                        { startTime: { [Op.lt]: checkEndTime } },
                        { endTime: { [Op.gt]: checkStartTime } }
                    ]
                }
            });

            if (existingBooking) {
                throw new Error('Venue is already booked for this time slot');
            }
        }

        await booking.update(updateData);

        // Create Log
        await BookingLog.create({
            bookingId: booking.id,
            userId: user.id,
            action: 'update',
            details: updateData
        });

        return booking;
    }

    async deleteBooking(id, user) {
        const booking = await this.getBookingById(id);
        if (!booking) {
            throw new Error('Booking not found');
        }

        // Authorization check
        if (booking.userId !== user.id && user.role !== 'admin') {
            throw new Error('Not authorized to delete this booking');
        }

        // Store details for waitlist check before deletion
        const { venueId, date, startTime, endTime } = booking;

        try {
            await BookingLog.create({
                bookingId: booking.id,
                userId: user.id,
                action: 'delete',
                details: {
                    venueId, date, startTime, endTime
                }
            });
        } catch (logError) {
            console.error('Failed to create delete log:', logError);
        }

        // 1. Nullify bookingId in Orders
        await Order.update({ bookingId: null }, {
            where: { bookingId: booking.id }
        });

        // 2. Delete associated logs
        await BookingLog.destroy({
            where: { bookingId: booking.id }
        });

        // 3. Delete Booking
        await booking.destroy();

        // Check Waitlist
        await this.checkWaitlist(venueId, date, startTime, endTime);

        return true;
    }

    async checkWaitlist(venueId, date, startTime, endTime) {
        try {
            // Find people waiting for this slot
            const waitlistEntries = await Waitlist.findAll({
                where: {
                    venueId,
                    date,
                    startTime,
                    endTime,
                    notified: false
                },
                include: [{ model: User, attributes: ['email', 'name'] }]
            });

            if (waitlistEntries.length > 0) {
                // Notify them
                for (const entry of waitlistEntries) {
                    try {
                        if (entry.User && entry.User.email) {
                            await sendEmail({
                                email: entry.User.email,
                                subject: 'Slot Available!',
                                message: `Good news ${entry.User.name}! A slot has opened up at Venue ${venueId} on ${date} from ${startTime} to ${endTime}. Log in now to book it!`
                            });

                            // Mark as notified
                            await entry.update({ notified: true });
                        }
                    } catch (error) {
                        console.error(`Failed to notify user ${entry.userId}`, error);
                    }
                }
            }
        } catch (error) {
            console.error('Error checking waitlist:', error);
        }
    }
}


module.exports = new BookingService();
