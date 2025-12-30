require('dotenv').config();
const { sequelize } = require('./config/database');
const Booking = require('./modules/bookings/booking.model');
const { getDailySummary } = require('./modules/bookings/booking.controller');

// Mock request and response
const mockReq = {
    user: { role: 'admin' },
    query: {}
};
const mockRes = {
    status: function (code) {
        this.statusCode = code;
        return this;
    },
    json: function (data) {
        console.log('Response:', JSON.stringify(data, null, 2));
        return this;
    }
};
const mockNext = (err) => console.error('Error:', err);

async function testDailySummary() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');
        await Booking.sync(); // Ensure 'no-show' enum is updated

        // Create dummy bookings for TODAY
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        // Tomorrow date string
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        // 1. Booking at 1 PM Today (Inside window) - Confirmed
        await Booking.create({
            date: todayStr,
            startTime: '13:00:00',
            endTime: '14:00:00',
            totalPrice: 100,
            status: 'confirmed',
            userId: 1, // Assuming user 1 exists
            venueId: 1 // Assuming venue 1 exists
        });

        // 2. Booking at 6 PM Today (Inside window) - No Show
        await Booking.create({
            date: todayStr,
            startTime: '18:00:00',
            endTime: '19:00:00',
            totalPrice: 150,
            status: 'no-show',
            userId: 1,
            venueId: 1
        });

        // 3. Booking at 2 AM Tomorrow (Inside window) - Confirmed
        await Booking.create({
            date: tomorrowStr,
            startTime: '02:00:00',
            endTime: '03:00:00',
            totalPrice: 200,
            status: 'confirmed',
            userId: 1,
            venueId: 1
        });

        // 4. Booking at 10 AM Today (Outside window - too early)
        await Booking.create({
            date: todayStr,
            startTime: '10:00:00',
            endTime: '11:00:00',
            totalPrice: 50,
            status: 'confirmed',
            userId: 1,
            venueId: 1
        });

        console.log('Running getDailySummary...');
        await getDailySummary(mockReq, mockRes, mockNext);

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await sequelize.close();
    }
}

testDailySummary();
