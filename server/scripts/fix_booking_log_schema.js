const { sequelize } = require('../src/config/database');

async function fixBookingLogSchema() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database');

        console.log('🔄 Altering booking_logs table...');

        // Raw SQL to drop the NOT NULL constraint
        await sequelize.query('ALTER TABLE "booking_logs" ALTER COLUMN "bookingId" DROP NOT NULL;');

        console.log('✅ Successfully removed NOT NULL constraint from bookingId');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to update schema:', error);
        process.exit(1);
    }
}

fixBookingLogSchema();
