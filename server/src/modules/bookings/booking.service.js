const Booking = require('./booking.model');
const BookingLog = require('./bookingLog.model');
const Venue = require('../venues/venue.model');
const User = require('../users/user.model');
const Order = require('../store/order.model');
const Waitlist = require('./waitlist.model');
const BookingStatus = require('../settings/bookingStatus.model');
const sendEmail = require('../../utils/emailService');
const Branch = require('../branches/branch.model');
const skeddaService = require('./skedda.service');
const { Op } = require('sequelize');

class BookingService {
    // Helper method to create comprehensive booking logs
    async _createBookingLog(bookingId, userId, action, details = {}, user = null) {
        const logData = {
            bookingId,
            userId: userId || (user ? user.id : null),
            action,
            details: {
                // Include timestamp in the details for easy reference
                logTimestamp: new Date().toISOString(),
                // Store booking ID to preserve it even if the booking is deleted (orphaned log)
                bookingSnapshotId: bookingId,
                // Include user info if available
                ...(user && {
                    userName: user.name,
                    userEmail: user.email,
                    userRole: user.role
                }),
                // Include the main details
                ...details
            }
        };

        try {
            await BookingLog.create(logData);
        } catch (error) {
            console.error(`Failed to create booking log for action ${action}:`, error);
            // Don't fail the main operation if logging fails
        }
    }

    // ... existing methods ...

    // ...

    async getBookings(options = {}, requester = null) {
        const { limit, offset, date, startDate, endDate, userId } = options;
        const where = {};

        // If a date is provided (grid view), we want to show ALL bookings for that day
        // to maintain the grid structure, but we will mask non-owned data later.
        if (date) {
            where.date = date;
        } else if (startDate && endDate) {
            where.date = {
                [Op.between]: [startDate, endDate]
            };
        }

        // If an explicit userId filter is provided (e.g. Admin filtering or User history)
        if (userId) {
            where.userId = userId;
        } else if (!date && !startDate && requester && requester.role !== 'admin') {
            // Default to own bookings for non-admins if no other date/range filters are active
            // and no explicit userId was requested
            where.userId = requester.id;
        }

        const result = await Booking.findAndCountAll({
            where,
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            attributes: { exclude: ['status'] },
            include: [
                {
                    model: Venue,
                    attributes: ['name', 'location'],
                    include: [{ model: Branch, attributes: ['name', 'location'] }]
                },
                { model: User, attributes: ['id', 'name', 'email', 'phone'] },
                { model: BookingStatus, attributes: ['id', 'name', 'color', 'description'] }
            ]
        });

        // Fetch and Merge Skedda Bookings (if date filtering is applied)
        // We only fetch if specific dates are requested to avoid fetching huge datasets
        if (date || (startDate && endDate)) {
            try {
                // Determine range
                const sStart = date ? `${date}T00:00:00` : `${startDate}T00:00:00`;
                const sEnd = date ? `${date}T23:59:59` : `${endDate}T23:59:59`;

                const skeddaBookings = await skeddaService.getFormattedBookings(sStart, sEnd);

                // Append to rows
                result.rows = [...result.rows, ...skeddaBookings];
                result.count += skeddaBookings.length;

                // Re-sort if needed (by start time)
                result.rows.sort((a, b) => {
                    // Handle both Sequelize instances and plain objects
                    const dateA = a.date || a.getDataValue('date');
                    const timeA = a.startTime || a.getDataValue('startTime');
                    const dateB = b.date || b.getDataValue('date');
                    const timeB = b.startTime || b.getDataValue('startTime');

                    return new Date(`${dateA}T${timeA}`) - new Date(`${dateB}T${timeB}`);
                });

            } catch (err) {
                console.error('Failed to fetch Skedda bookings for list:', err.message);
                // Don't fail the whole request, just log and continue with local bookings
            }
        }

        // Privacy Masking (Only for non-admins)
        if (requester && requester.role !== 'admin') {
            result.rows = result.rows.map(booking => {
                const b = booking instanceof Booking ? booking.get({ plain: true }) : booking;
                // If the booking doesn't belong to the requester and it's not an open match
                if (b.userId !== requester.id && !b.isOpenMatch) {
                    // For public users, always show real names but mask contact info (for grid view)
                    // For authenticated users, differentiate between grid and list views
                    if (requester.role === 'public' || date) {
                        // Grid view or public user: show real names but mask sensitive contact info
                        if (b.User) {
                            b.User = {
                                id: b.User.id,
                                name: b.User.name, // Show real name for grid view
                                email: '***',
                                phone: '***'
                            };
                        }
                    } else {
                        // List view for authenticated users: show "Reserved" for privacy
                        if (b.User) {
                            b.User = {
                                id: b.User.id,
                                name: 'Reserved',
                                email: '***',
                                phone: '***'
                            };
                        }
                    }
                    // Optional: mask other sensitive booking fields if any
                }
                return b;
            });
        }

        return result;
    }

    async getBookingById(id) {
        return await Booking.findByPk(id, {
            attributes: { exclude: ['status'] },
            include: [
                {
                    model: Venue,
                    attributes: ['name', 'location'],
                    include: [{ model: Branch, attributes: ['name', 'location'] }]
                },
                { model: User, attributes: ['name', 'email', 'phone'] },
                { model: BookingStatus, attributes: ['id', 'name', 'color', 'description'] }
            ]
        });
    }


    async createBooking(bookingData, user) {
        if (bookingData.statusId === '') bookingData.statusId = null;

        const { repeat } = bookingData;
        const occurrences = repeat?.count ? parseInt(repeat.count) : 1;
        const frequency = repeat?.frequency || 'weekly';

        if (occurrences > 1) {
            const recurrenceId = require('crypto').randomUUID();
            const dates = [];
            let currentDate = new Date(bookingData.date);

            for (let i = 0; i < occurrences; i++) {
                dates.push(currentDate.toISOString().split('T')[0]);
                if (frequency === 'weekly') {
                    currentDate.setDate(currentDate.getDate() + 7);
                } else if (frequency === 'daily') {
                    currentDate.setDate(currentDate.getDate() + 1);
                }
            }

            // 1. Pre-check availability for ALL dates
            for (const date of dates) {
                const existingBooking = await Booking.findOne({
                    where: {
                        venueId: bookingData.venueId,
                        date: date,
                        [Op.and]: [
                            { startTime: { [Op.lt]: bookingData.endTime.substring(0, 5) === '00:00' ? '23:59:59' : bookingData.endTime.substring(0, 5) } },
                            { endTime: { [Op.gt]: bookingData.startTime.substring(0, 5) } }
                        ]
                    }
                });

                if (existingBooking) {
                    throw new Error(`Conflict on ${date}: Venue is already booked for this time slot`);
                }
            }

            // 2. Create bookings
            const results = [];
            for (const date of dates) {
                const booking = await this._internalCreateSingleBooking({
                    ...bookingData,
                    date,
                    recurrenceId
                }, user);
                results.push(booking);
            }

            return results; // Return all created bookings
        }

        return await this._internalCreateSingleBooking(bookingData, user);
    }

    async _internalCreateSingleBooking(bookingData, user) {
        // Check availability (double check for safety or single booking case)
        const existingBooking = await Booking.findOne({
            where: {
                venueId: bookingData.venueId,
                date: bookingData.date,
                [Op.and]: [
                    { startTime: { [Op.lt]: bookingData.endTime.substring(0, 5) === '00:00' ? '23:59:59' : bookingData.endTime.substring(0, 5) } },
                    { endTime: { [Op.gt]: bookingData.startTime.substring(0, 5) } }
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

        // Determine status string: if statusId is provided, get its name; otherwise use default
        let status = bookingData.type === 'academy' ? 'pending-coach' : 'pending';
        let statusId = bookingData.statusId;

        if (statusId) {
            const statusRecord = await BookingStatus.findByPk(statusId);
            if (statusRecord) {
                status = statusRecord.name;
            }
        } else {
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

        // Create comprehensive log
        const targetUser = await User.findByPk(userId);
        const targetVenue = await Venue.findByPk(bookingData.venueId);

        await this._createBookingLog(booking.id, user.id, 'create', {
            status,
            type: bookingData.type,
            venueId: bookingData.venueId,
            venueName: targetVenue ? targetVenue.name : `Court #${bookingData.venueId}`,
            userId: userId,
            targetUserName: targetUser ? targetUser.name : `User #${userId}`,
            totalPrice: booking.totalPrice || bookingData.totalPrice,
            date: booking.date,
            startTime: booking.startTime,
            endTime: booking.endTime,
            isRecurring: !!bookingData.repeat,
            recurrenceDetails: bookingData.repeat ? {
                count: bookingData.repeat.count,
                frequency: bookingData.repeat.frequency
            } : null
        }, user);

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

        return await this.getBookingById(booking.id);
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

        const logs = await BookingLog.findAndCountAll({
            where,
            limit,
            offset,
            order: [['timestamp', 'DESC']],
            include: [
                { model: User, attributes: ['id', 'name', 'email', 'phone'] },
                { model: Booking, attributes: ['id', 'date', 'startTime'] }
            ]
        });

        // Resolve names for IDs in details on the fly
        const userCache = new Map();
        const venueCache = new Map();

        for (const log of logs.rows) {
            if (log.details) {
                // Resolve User
                if (log.details.userId && !log.details.targetUserName) {
                    const uid = Number(log.details.userId);
                    if (!userCache.has(uid)) {
                        const u = await User.findByPk(uid, { attributes: ['name'] });
                        userCache.set(uid, u ? u.name : null);
                    }
                    if (userCache.get(uid)) {
                        log.details.targetUserName = userCache.get(uid);
                    }
                }

                // Resolve Venue
                if (log.details.venueId && !log.details.venueName) {
                    const vid = Number(log.details.venueId);
                    if (!venueCache.has(vid)) {
                        const v = await Venue.findByPk(vid, { attributes: ['name'] });
                        venueCache.set(vid, v ? v.name : null);
                    }
                    if (venueCache.get(vid)) {
                        log.details.venueName = venueCache.get(vid);
                    }
                }

                // Resolve Changes labels (From and To)
                if (log.details.changes) {
                    for (const [key, change] of Object.entries(log.details.changes)) {
                        // Resolve User Names
                        if (key === 'userId') {
                            if (!change.fromLabel && change.from) {
                                const uid = Number(change.from);
                                if (!userCache.has(uid)) {
                                    const u = await User.findByPk(uid, { attributes: ['name'] });
                                    userCache.set(uid, u ? u.name : null);
                                }
                                change.fromLabel = userCache.get(uid) || `User #${uid}`;
                            }
                            if (!change.toLabel && change.to) {
                                const uid = Number(change.to);
                                if (!userCache.has(uid)) {
                                    const u = await User.findByPk(uid, { attributes: ['name'] });
                                    userCache.set(uid, u ? u.name : null);
                                }
                                change.toLabel = userCache.get(uid) || `User #${uid}`;
                            }
                        }
                        // Resolve Venue Names
                        else if (key === 'venueId') {
                            if (!change.fromLabel && change.from) {
                                const vid = Number(change.from);
                                if (!venueCache.has(vid)) {
                                    const v = await Venue.findByPk(vid, { attributes: ['name'] });
                                    venueCache.set(vid, v ? v.name : null);
                                }
                                change.fromLabel = venueCache.get(vid) || `Court #${vid}`;
                            }
                            if (!change.toLabel && change.to) {
                                const vid = Number(change.to);
                                if (!venueCache.has(vid)) {
                                    const v = await Venue.findByPk(vid, { attributes: ['name'] });
                                    venueCache.set(vid, v ? v.name : null);
                                }
                                change.toLabel = venueCache.get(vid) || `Court #${vid}`;
                            }
                        }
                    }
                }
            }
        }

        return logs;
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
            (updateData.startTime && updateData.startTime.substring(0, 5) !== booking.startTime.substring(0, 5)) ||
            (updateData.endTime && updateData.endTime.substring(0, 5) !== booking.endTime.substring(0, 5)) ||
            (updateData.venueId && Number(updateData.venueId) !== Number(booking.venueId));

        if (isTimeOrVenueChanging) {
            const checkDate = updateData.date || booking.date;
            const checkStartTime = (updateData.startTime || booking.startTime).substring(0, 5);
            const checkEndTime = (updateData.endTime || booking.endTime).substring(0, 5);
            const checkVenueId = updateData.venueId || booking.venueId;

            // Only check availability if the new time slot is actually different from the current one
            // We compare only HH:mm to avoid seconds mismatch (e.g. 10:00 vs 10:00:00)
            const isSameTimeSlot = checkDate === booking.date &&
                checkStartTime === booking.startTime.substring(0, 5) &&
                checkEndTime === booking.endTime.substring(0, 5) &&
                Number(checkVenueId) === Number(booking.venueId);

            console.log(`[DEBUG] Updating booking ${id}:`);
            console.log(`[DEBUG] Current: date=${booking.date}, start=${booking.startTime}, end=${booking.endTime}, venue=${booking.venueId}`);
            console.log(`[DEBUG] New: date=${checkDate}, start=${checkStartTime}, end=${checkEndTime}, venue=${checkVenueId}`);
            console.log(`[DEBUG] Same time slot: ${isSameTimeSlot}, Current booking ID: ${booking.id}`);

            if (!isSameTimeSlot) {
                console.log(`[DEBUG] Checking availability for venue ${checkVenueId} on ${checkDate} from ${checkStartTime} to ${checkEndTime}`);

                // Use explicit ID normalization for exclusion
                const targetBookingId = Number(booking.id);

                const existingBooking = await Booking.findOne({
                    where: {
                        venueId: Number(checkVenueId),
                        date: checkDate,
                        id: { [Op.ne]: targetBookingId },
                        [Op.and]: [
                            { startTime: { [Op.lt]: checkEndTime === '00:00' ? '23:59:59' : checkEndTime } },
                            { endTime: { [Op.gt]: checkStartTime } }
                        ]
                    }
                });

                if (existingBooking) {
                    console.log(`[DEBUG] Conflict found with booking ID: ${existingBooking.id}`);
                    throw new Error('Venue is already booked for this time slot');
                }
            }
        }

        const seriesOption = updateData.seriesOption || 'single';
        delete updateData.seriesOption;

        if (seriesOption === 'upcoming' && booking.recurrenceId) {
            const bookingsToUpdate = await Booking.findAll({
                where: {
                    recurrenceId: booking.recurrenceId,
                    date: { [Op.gte]: booking.date }
                }
            });

            for (const b of bookingsToUpdate) {
                // For each booking, we still want to check availability if crucial fields change
                // But bulk update might be complex if venue/time changes cause conflicts in future slots.
                // For simplicity as requested, we'll apply the updateData to all.
                // If venue/time is changing, we should ideally re-run availability checks for each slot.

                if (isTimeOrVenueChanging) {
                    const checkDate = updateData.date || b.date;
                    const checkStartTime = (updateData.startTime || b.startTime).substring(0, 5);
                    const checkEndTime = (updateData.endTime || b.endTime).substring(0, 5);
                    const checkVenueId = updateData.venueId || b.venueId;

                    const conflict = await Booking.findOne({
                        where: {
                            id: { [Op.ne]: b.id },
                            venueId: Number(checkVenueId),
                            date: checkDate,
                            // Exclude other bookings in the same recurrence series to avoid self-conflicts
                            recurrenceId: { [Op.ne]: booking.recurrenceId },
                            [Op.and]: [
                                { startTime: { [Op.lt]: checkEndTime === '00:00' ? '23:59:59' : checkEndTime } },
                                { endTime: { [Op.gt]: checkStartTime } }
                            ]
                        }
                    });

                    if (conflict) {
                        throw new Error(`Conflict on ${checkDate}: This slot is already taken by another booking.`);
                    }
                }

                // Create comprehensive update log
                const changes = Object.keys(updateData).reduce((acc, key) => {
                    if (updateData[key] !== b[key]) {
                        acc[key] = {
                            from: b[key],
                            to: updateData[key]
                        };
                    }
                    return acc;
                }, {});

                await b.update(updateData);
                await this._createBookingLog(b.id, user.id, 'update', {
                    originalData: {
                        date: b.date,
                        startTime: b.startTime,
                        endTime: b.endTime,
                        status: b.status,
                        totalPrice: b.totalPrice
                    },
                    changes,
                    updateData,
                    seriesOption: 'upcoming'
                }, user);
            }
            return bookingsToUpdate[0];
        }

        // Create comprehensive update log with resolved names
        const changes = {};
        for (const key of Object.keys(updateData)) {
            if (updateData[key] !== booking[key]) {
                const change = {
                    from: booking[key],
                    to: updateData[key]
                };

                // Add readable labels for IDs
                if (key === 'userId') {
                    const fromUser = await User.findByPk(booking.userId);
                    const toUser = await User.findByPk(updateData.userId);
                    change.fromLabel = fromUser ? fromUser.name : `User #${booking.userId}`;
                    change.toLabel = toUser ? toUser.name : `User #${updateData.userId}`;
                } else if (key === 'venueId') {
                    const fromVenue = await Venue.findByPk(booking.venueId);
                    const toVenue = await Venue.findByPk(updateData.venueId);
                    change.fromLabel = fromVenue ? fromVenue.name : `Court #${booking.venueId}`;
                    change.toLabel = toVenue ? toVenue.name : `Court #${updateData.venueId}`;
                } else if (key === 'statusId' && updateData.statusId) {
                    const fromStatus = await BookingStatus.findByPk(booking.statusId);
                    const toStatus = await BookingStatus.findByPk(updateData.statusId);
                    change.fromLabel = fromStatus ? fromStatus.name : (booking.status || `Status #${booking.statusId}`);
                    change.toLabel = toStatus ? toStatus.name : `Status #${updateData.statusId}`;
                }

                changes[key] = change;
            }
        }

        await booking.update(updateData);

        await this._createBookingLog(booking.id, user.id, 'update', {
            originalData: {
                date: booking.date,
                startTime: booking.startTime,
                endTime: booking.endTime,
                status: booking.status,
                totalPrice: booking.totalPrice
            },
            changes,
            updateData,
            seriesOption: seriesOption
        }, user);

        return await this.getBookingById(id);
    }

    async deleteBooking(id, user, seriesOption = 'single') {
        const booking = await this.getBookingById(id);
        if (!booking) {
            throw new Error('Booking not found');
        }

        // Authorization check
        if (booking.userId !== user.id && user.role !== 'admin') {
            throw new Error('Not authorized to delete this booking');
        }

        if (seriesOption === 'upcoming' && booking.recurrenceId) {
            const bookingsToDelete = await Booking.findAll({
                where: {
                    recurrenceId: booking.recurrenceId,
                    date: { [Op.gte]: booking.date }
                }
            });

            for (const b of bookingsToDelete) {
                await this._internalDeleteSingleBooking(b, user);
            }
            return true;
        }

        return await this._internalDeleteSingleBooking(booking, user, seriesOption);
    }

    async _internalDeleteSingleBooking(booking, user, seriesOption = 'single') {
        // Store details for waitlist check before deletion
        const { venueId, date, startTime, endTime } = booking;

        // 1. Nullify bookingId in Orders
        await Order.update({ bookingId: null }, {
            where: { bookingId: booking.id }
        });

        // 2. Unlink associated logs instead of destroying them
        const targetUserLabel = await User.findByPk(booking.userId);
        const targetVenueLabel = await Venue.findByPk(booking.venueId);

        // First, create the delete log (linked initially so we have the record)
        await this._createBookingLog(booking.id, user.id, 'delete', {
            venueId: booking.venueId,
            venueName: targetVenueLabel ? targetVenueLabel.name : `Court #${booking.venueId}`,
            date: booking.date,
            startTime: booking.startTime,
            endTime: booking.endTime,
            status: booking.status,
            totalPrice: booking.totalPrice,
            bookingId: booking.id, // Explicitly store ID in details
            userId: booking.userId,
            targetUserName: targetUserLabel ? targetUserLabel.name : `User #${booking.userId}`,
            seriesOption: seriesOption
        }, user);

        // Then unlink ALL logs for this booking (including the new delete log)
        await BookingLog.update({ bookingId: null }, {
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
        const previousData = {
            isOpenMatch: booking.isOpenMatch,
            openMatchMaxPlayers: booking.openMatchMaxPlayers,
            openMatchPlayers: booking.openMatchPlayers
        };

        await booking.update({
            isOpenMatch: true,
            openMatchMaxPlayers: maxPlayers,
            openMatchPlayers: [booking.userId] // Add owner as first player
        });

        // Log the conversion
        await this._createBookingLog(booking.id, userId, 'convert_to_open_match', {
            previousData,
            newData: {
                isOpenMatch: true,
                openMatchMaxPlayers: maxPlayers,
                openMatchPlayers: [booking.userId]
            }
        });

        return await this.getBookingById(bookingId);
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
        const previousPlayers = [...booking.openMatchPlayers];
        const updatedPlayers = [...booking.openMatchPlayers, userId];

        await booking.update({
            openMatchPlayers: updatedPlayers
        });

        // Log the join
        await this._createBookingLog(booking.id, userId, 'join_open_match', {
            previousPlayers,
            updatedPlayers,
            action: 'added_user',
            userId
        });

        return await this.getBookingById(bookingId);
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
        const previousPlayers = [...booking.openMatchPlayers];
        const updatedPlayers = booking.openMatchPlayers.filter(playerId => playerId !== userId);

        await booking.update({
            openMatchPlayers: updatedPlayers
        });

        // Log the leave
        await this._createBookingLog(booking.id, userId, 'leave_open_match', {
            previousPlayers,
            updatedPlayers,
            action: 'removed_user',
            userId
        });

        return await this.getBookingById(bookingId);
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
            attributes: { exclude: ['status'] },
            include: [
                { model: Venue, attributes: ['name', 'location'] },
                { model: User, attributes: ['name', 'phone'] },
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
    async getFreeSlots(options) {
        const { startDate, startTime, endDate, endTime, branchId } = options;

        const venues = await Venue.findAll({
            where: branchId !== 'all' ? { branchId } : {},
            include: [{ model: Branch, attributes: ['name'] }]
        });

        const bookings = await Booking.findAll({
            where: {
                date: { [Op.between]: [startDate, endDate] }
            }
        });

        const freeSlotsByVenue = {}; // { "Center Court": ["5pm to 12am", "2am to 3am"] }

        // Local time parsing for range boundaries
        const startTS = new Date(`${startDate}T${startTime}:00:00`).getTime();
        const endTS = new Date(`${endDate}T${endTime}:00:00`).getTime();
        const hourMS = 60 * 60 * 1000;

        venues.forEach(venue => {
            let currentTS = startTS;
            let currentRangeStart = null;
            const venueRanges = [];

            while (currentTS < endTS) {
                const dateObj = new Date(currentTS);
                const dateStr = dateObj.toISOString().split('T')[0];
                const hh = dateObj.getHours();
                const hourStr = hh.toString().padStart(2, '0') + ':00:00';

                // Check if this hour is booked
                const isBooked = bookings.some(b =>
                    b.venueId === venue.id &&
                    b.date === dateStr &&
                    b.startTime <= hourStr &&
                    b.endTime > hourStr
                );

                if (!isBooked) {
                    if (currentRangeStart === null) {
                        currentRangeStart = currentTS;
                    }
                } else {
                    if (currentRangeStart !== null) {
                        venueRanges.push(this._formatFreeRange(currentRangeStart, currentTS));
                        currentRangeStart = null;
                    }
                }

                currentTS += hourMS;
            }

            if (currentRangeStart !== null) {
                venueRanges.push(this._formatFreeRange(currentRangeStart, endTS));
            }

            if (venueRanges.length > 0) {
                const displayName = venue.Branch ? `${venue.name} (${venue.Branch.name})` : venue.name;
                freeSlotsByVenue[displayName] = venueRanges;
            }
        });

        return freeSlotsByVenue;
    }

    _formatFreeRange(startTS, endTS) {
        if (startTS >= endTS) return '';

        const formatH = (ts, isEnd = false) => {
            const date = new Date(ts);
            let h = date.getHours();

            // If it's the end of a range and it's midnight, show "12am"
            if (isEnd && h === 0) return "12am";

            const ampm = (h >= 12 && h <= 23) ? 'pm' : 'am';
            const h12 = h % 12 || 12;
            return `${h12}${ampm}`;
        };

        return `${formatH(startTS)} to ${formatH(endTS, true)}`;
    }
}


module.exports = new BookingService();
