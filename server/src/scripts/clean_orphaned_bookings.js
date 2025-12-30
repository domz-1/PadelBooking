const { sequelize } = require('../config/database');
const Booking = require('../modules/bookings/booking.model');
const User = require('../modules/users/user.model');
const { Op } = require('sequelize');

const cleanOrphanedBookings = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ PostgreSQL Connected');

        // Get all user IDs
        const users = await User.findAll({ attributes: ['id'] });
        const userIds = users.map(u => u.id);
        console.log(`Found ${userIds.length} users.`);

        // Find bookings with invalid userId
        const orphanedBookings = await Booking.findAll({
            where: {
                userId: {
                    [Op.notIn]: userIds
                }
            }
        });

        console.log(`Found ${orphanedBookings.length} orphaned bookings.`);

        if (orphanedBookings.length > 0) {
            const orphanedBookingIds = orphanedBookings.map(b => b.id);

            // Delete related logs first
            // We need to import BookingLog model or use raw query if model not available easily
            // Assuming BookingLog model is available or we can use sequelize.query
            await sequelize.query(
                `DELETE FROM "BookingLogs" WHERE "bookingId" IN (:ids)`,
                {
                    replacements: { ids: orphanedBookingIds },
                    type: sequelize.QueryTypes.DELETE
                }
            );
            console.log('✅ Related BookingLogs deleted.');

            await Booking.destroy({
                where: {
                    userId: {
                        [Op.notIn]: userIds
                    }
                }
            });
            console.log('✅ Orphaned bookings deleted.');
        } else {
            console.log('✅ No orphaned bookings found.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Cleanup failed:', error);
        process.exit(1);
    }
};

cleanOrphanedBookings();
