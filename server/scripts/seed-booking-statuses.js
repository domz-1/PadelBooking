const { sequelize } = require('../src/config/database');
const BookingStatus = require('../src/modules/settings/bookingStatus.model');

const seedBookingStatuses = async () => {
    try {
        console.log('🔧 Seeding booking statuses...');
        await sequelize.authenticate();
        
        // Check if statuses already exist
        const existingStatuses = await BookingStatus.findAll();
        if (existingStatuses.length > 0) {
            console.log('✅ Booking statuses already seeded');
            console.log('Existing statuses:');
            existingStatuses.forEach(s => {
                console.log(`  - ${s.id}: ${s.name} (${s.color})`);
            });
            return;
        }
        
        // Define standard booking statuses
        const statuses = [
            {
                name: 'Pending',
                color: '#F59E0B', // Amber
                description: 'Booking is pending confirmation',
                isDefault: true
            },
            {
                name: 'Confirmed',
                color: '#10B981', // Green
                description: 'Booking is confirmed and active',
                isDefault: true
            },
            {
                name: 'Cancelled',
                color: '#EF4444', // Red
                description: 'Booking was cancelled by user or admin',
                isDefault: true
            },
            {
                name: 'Completed',
                color: '#06B6D4', // Cyan
                description: 'Booking was completed successfully',
                isDefault: true
            },
            {
                name: 'No Show',
                color: '#7C3AED', // Purple
                description: 'User did not show up for the booking',
                isDefault: true
            },
            {
                name: 'Pending Coach',
                color: '#F97316', // Orange
                description: 'Waiting for coach assignment/confirmation',
                isDefault: true
            },
            {
                name: 'Rescheduled',
                color: '#3B82F6', // Blue
                description: 'Booking was rescheduled to a different time',
                isDefault: false
            },
            {
                name: 'Refunded',
                color: '#14B8A6', // Teal
                description: 'Booking was refunded to the customer',
                isDefault: false
            },
            {
                name: 'Waitlisted',
                color: '#8B5CF6', // Violet
                description: 'User is on waitlist for this time slot',
                isDefault: false
            },
            {
                name: 'Checked In',
                color: '#22C55E', // Emerald
                description: 'User has checked in for the booking',
                isDefault: false
            }
        ];
        
        // Create statuses
        for (const status of statuses) {
            await BookingStatus.create(status);
            console.log(`✅ Created status: ${status.name} (${status.color})`);
        }
        
        console.log('🎉 Booking statuses seeded successfully!');
        console.log(`Created ${statuses.length} booking statuses`);
        
    } catch (error) {
        console.error('❌ Error seeding booking statuses:', error.message);
        process.exit(1);
    }
};

seedBookingStatuses();