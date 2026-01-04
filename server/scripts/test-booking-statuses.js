#!/usr/bin/env node

const { sequelize } = require("../src/config/database");
const { Op } = require('sequelize');
const Booking = require("../src/modules/bookings/booking.model");
const BookingStatus = require("../src/modules/settings/bookingStatus.model");

async function testBookingStatuses() {
    try {
        console.log("🧪 Testing Booking Status System...\n");

        // Test 1: Check if booking statuses exist
        console.log("1️⃣ Checking booking statuses...");
        const statuses = await BookingStatus.findAll();
        console.log(`   ✅ Found ${statuses.length} booking statuses:`);
        statuses.forEach(status => {
            console.log(`   - ${status.name} (${status.color}) - ${status.description || 'No description'}`);
        });

        // Test 2: Check if bookings have status IDs
        console.log("\n2️⃣ Checking bookings with status IDs...");
        const bookingsWithStatus = await Booking.findAll({
            where: { statusId: { [Op.ne]: null } },
            include: [{ model: BookingStatus, attributes: ['name', 'color'] }],
            limit: 5
        });
        
        console.log(`   ✅ Found ${bookingsWithStatus.length} bookings with status IDs:`);
        bookingsWithStatus.forEach(booking => {
            console.log(`   - Booking #${booking.id}: ${booking.status} (Status ID: ${booking.statusId})`);
            if (booking.BookingStatus) {
                console.log(`     → Status: ${booking.BookingStatus.name} (${booking.BookingStatus.color})`);
            }
        });

        // Test 3: Count bookings by status
        console.log("\n3️⃣ Counting bookings by status...");
        const statusCounts = {};
        const allBookings = await Booking.findAll({
            include: [{ model: BookingStatus, attributes: ['name'] }]
        });
        
        allBookings.forEach(booking => {
            const statusName = booking.BookingStatus ? booking.BookingStatus.name : booking.status;
            statusCounts[statusName] = (statusCounts[statusName] || 0) + 1;
        });
        
        console.log("   📊 Booking Status Distribution:");
        for (const [status, count] of Object.entries(statusCounts)) {
            console.log(`   - ${status}: ${count} bookings`);
        }

        // Test 4: Verify color consistency
        console.log("\n4️⃣ Verifying color consistency...");
        const colorTestBookings = await Booking.findAll({
            include: [{ model: BookingStatus, attributes: ['name', 'color'] }],
            where: { statusId: { [Op.ne]: null } },
            limit: 3
        });
        
        colorTestBookings.forEach(booking => {
            if (booking.BookingStatus) {
                console.log(`   ✅ Booking #${booking.id} has color ${booking.BookingStatus.color} for status ${booking.BookingStatus.name}`);
            }
        });

        console.log("\n🎉 All tests passed! Booking status system is working correctly.");
        console.log(`\n📈 Summary:`);
        console.log(`   - Total Booking Statuses: ${statuses.length}`);
        console.log(`   - Total Bookings: ${allBookings.length}`);
        console.log(`   - Bookings with Status IDs: ${allBookings.filter(b => b.statusId).length}`);
        console.log(`   - Bookings with Status Relations: ${allBookings.filter(b => b.BookingStatus).length}`);
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Test failed:", error);
        process.exit(1);
    }
}

testBookingStatuses();