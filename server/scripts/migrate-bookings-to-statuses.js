const { sequelize } = require('../src/config/database');
const Booking = require('../src/modules/bookings/booking.model');
const BookingStatus = require('../src/modules/settings/bookingStatus.model');

async function migrateBookings() {
    try {
        console.log('Starting booking migration...');
        
        // Create default statuses if they don't exist
        const defaultStatuses = [
            { name: 'pending', color: '#F59E0B', description: 'Booking is pending confirmation' },
            { name: 'confirmed', color: '#10B981', description: 'Booking is confirmed' },
            { name: 'cancelled', color: '#EF4444', description: 'Booking was cancelled' },
            { name: 'completed', color: '#06B6D4', description: 'Booking was completed' },
            { name: 'no-show', color: '#6B7280', description: 'Customer did not show up' },
            { name: 'pending-coach', color: '#3B82F6', description: 'Waiting for coach assignment' }
        ];

        for (const status of defaultStatuses) {
            const [statusRecord, created] = await BookingStatus.findOrCreate({
                where: { name: status.name },
                defaults: status
            });
            if (created) {
                console.log(`Created status: ${status.name}`);
            }
        }

        // Get all statuses
        const statuses = await BookingStatus.findAll();
        const statusMap = {};
        statuses.forEach(s => statusMap[s.name] = s.id);

        // Update all bookings
        const bookings = await Booking.findAll();
        let updatedCount = 0;

        for (const booking of bookings) {
            if (booking.status && statusMap[booking.status]) {
                await booking.update({ statusId: statusMap[booking.status] });
                updatedCount++;
            }
        }

        console.log(`Migration complete. Updated ${updatedCount} bookings.`);
        
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await sequelize.close();
    }
}

migrateBookings();