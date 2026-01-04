const Booking = require('./booking.model');
const BookingLog = require('./bookingLog.model');
const Venue = require('../venues/venue.model');
const User = require('../users/user.model');
const Order = require('../store/order.model');
const Waitlist = require('./waitlist.model');
const BookingStatus = require('../settings/bookingStatus.model');
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
                { model: User, attributes: ['name', 'email'] },
                { model: BookingStatus, attributes: ['id', 'name', 'color', 'description'] }
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
                { model: User, attributes: ['name', 'email'] },
                { model: BookingStatus, attributes: ['id', 'name', 'color', 'description'] }
            ]
        });
    }


    async createBooking(bookingData, user) {
        if (bookingData.statusId === '') bookingData.statusId = null;

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
        
        // Get statusId from status name if provided, otherwise use default
        let statusId = bookingData.statusId;
        if (!statusId) {
            const BookingStatus = require('../settings/bookingStatus.model');
            const statusRecord = await BookingStatus.findOne({ where: { name: status } });
            if (statusRecord) {
                statusId = statusRecord.id;
            }
        }
        
        // Set Open Match defaults
        const isOpenMatch = bookingData.isOpenMatch || false;
        const openMatchMaxPlayers = bookingData.openMatchMaxPlayers || (isOpenMatch ? 4 : null);

        // Determine userId: if admin and userId provided in data, use it; otherwise use logged-in user
        const userId = (user.role === 'admin' && bookingData.userId) ? bookingData.userId : user.id;

        const booking = await Booking.create({
            ...bookingData,
            userId,
            status,
            statusId,
            isOpenMatch,
            openMatchMaxPlayers,
            openMatchPlayers: isOpenMatch ? [userId] : []
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
        if (updateData.statusId === '') updateData.statusId = null;

        console.log(`[DEBUG] updateBooking called with id: ${id} (type: ${typeof id})`);

        const booking = await this.getBookingById(id);
        if (!booking) {
            throw new Error('Booking not found');
        }

        console.log(`[DEBUG] Found booking: ${booking.id} (venue: ${booking.venueId}, date: ${booking.date}, time: ${booking.startTime}-${booking.endTime})`);

        // Handle Open Match updates
        if (updateData.isOpenMatch !== undefined) {
            if (updateData.isOpenMatch) {
                // Converting to Open Match
                updateData.openMatchPlayers = booking.openMatchPlayers || [booking.userId];
                updateData.openMatchMaxPlayers = updateData.openMatchMaxPlayers || 4;
            } else {
                // Converting from Open Match to regular
                updateData.openMatchPlayers = [];
            }
        }

        // Check availability if time or venue is actually changing to different values
        const isTimeOrVenueChanging = 
            (updateData.date && updateData.date !== booking.date) ||
            (updateData.startTime && updateData.startTime !== booking.startTime) ||
            (updateData.endTime && updateData.endTime !== booking.endTime) ||
            (updateData.venueId && updateData.venueId !== booking.venueId);

        if (isTimeOrVenueChanging) {
            const checkDate = updateData.date || booking.date;
            const checkStartTime = updateData.startTime || booking.startTime;
            const checkEndTime = updateData.endTime || booking.endTime;
            const checkVenueId = updateData.venueId || booking.venueId;

            // Only check availability if the new time slot is actually different from the current one
            const isSameTimeSlot = checkDate === booking.date && 
                                  checkStartTime === booking.startTime && 
                                  checkEndTime === booking.endTime &&
                                  checkVenueId === booking.venueId;

            console.log(`[DEBUG] Updating booking ${id}:`);
            console.log(`[DEBUG] Current: date=${booking.date}, start=${booking.startTime}, end=${booking.endTime}, venue=${booking.venueId}`);
            console.log(`[DEBUG] New: date=${checkDate}, start=${checkStartTime}, end=${checkEndTime}, venue=${checkVenueId}`);
            console.log(`[DEBUG] Same time slot: ${isSameTimeSlot}, Current booking ID: ${booking.id}`);

            if (!isSameTimeSlot) {
                console.log(`[DEBUG] Checking availability for venue ${checkVenueId} on ${checkDate} from ${checkStartTime} to ${checkEndTime}`);
                console.log(`[DEBUG] Excluding booking ID: ${booking.id} (from DB)`);
                console.log(`[DEBUG] Original ID parameter: ${id} (type: ${typeof id})`);

                const existingBooking = await Booking.findOne({
                    where: {
                        venueId: checkVenueId,
                        date: checkDate,
                        id: { [Op.ne]: booking.id }, // Exclude current booking using the actual booking ID from DB
                        [Op.and]: [
                            { startTime: { [Op.lt]: checkEndTime } },
                            { endTime: { [Op.gt]: checkStartTime } }
                        ]
                    }
                });

                console.log(`[DEBUG] Existing booking found: ${existingBooking ? existingBooking.id : 'none'}`);
                if (existingBooking) {
                    console.log(`[DEBUG] Conflict details - Existing: ${existingBooking.startTime}-${existingBooking.endTime}, Requested: ${checkStartTime}-${checkEndTime}`);
                    throw new Error('Venue is already booked for this time slot');
                } else {
                    console.log(`[DEBUG] No conflicts found, proceeding with update`);
                }
            } else {
                console.log(`[DEBUG] Same time slot, skipping availability check`);
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

    // Open Match Methods
    async convertToOpenMatch(bookingId, userId, maxPlayers = 4) {
        const booking = await this.getBookingById(bookingId);
        if (!booking) {
            throw new Error('Booking not found');
        }

        // Only the booking owner can convert to Open Match
        if (booking.userId !== userId) {
            throw new Error('Only the booking owner can convert to Open Match');
        }

        // Update booking to Open Match
        await booking.update({
            isOpenMatch: true,
            openMatchMaxPlayers: maxPlayers,
            openMatchPlayers: [booking.userId] // Add owner as first player
        });

        return booking;
    }

    async joinOpenMatch(bookingId, userId) {
        const booking = await this.getBookingById(bookingId);
        if (!booking) {
            throw new Error('Booking not found');
        }

        if (!booking.isOpenMatch) {
            throw new Error('This is not an Open Match');
        }

        // Check if user is already in the match
        if (booking.openMatchPlayers.includes(userId)) {
            throw new Error('User already in this Open Match');
        }

        // Check if match is full
        if (booking.openMatchPlayers.length >= booking.openMatchMaxPlayers) {
            throw new Error('Open Match is full');
        }

        // Add user to the match
        const updatedPlayers = [...booking.openMatchPlayers, userId];
        
        await booking.update({
            openMatchPlayers: updatedPlayers
        });

        return booking;
    }

    async leaveOpenMatch(bookingId, userId) {
        const booking = await this.getBookingById(bookingId);
        if (!booking) {
            throw new Error('Booking not found');
        }

        if (!booking.isOpenMatch) {
            throw new Error('This is not an Open Match');
        }

        // Check if user is in the match
        if (!booking.openMatchPlayers.includes(userId)) {
            throw new Error('User not in this Open Match');
        }

        // Remove user from the match
        const updatedPlayers = booking.openMatchPlayers.filter(playerId => playerId !== userId);
        
        await booking.update({
            openMatchPlayers: updatedPlayers
        });

        return booking;
    }

    async getOpenMatches(date) {
        const where = {};
        if (date) {
            where.date = date;
        }

        return await Booking.findAll({
            where: {
                ...where,
                isOpenMatch: true
            },
            include: [
                { model: Venue, attributes: ['name', 'location'] },
                { model: User, attributes: ['name'] },
                { model: BookingStatus, attributes: ['name', 'color'] }
            ]
        });
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
