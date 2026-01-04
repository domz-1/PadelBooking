#!/usr/bin/env node

const { sequelize } = require("../src/config/database");
const Booking = require("../src/modules/bookings/booking.model");
const BookingStatus = require("../src/modules/settings/bookingStatus.model");
const User = require("../src/modules/users/user.model");
const bookingService = require("../src/modules/bookings/booking.service");

async function debugDeletionIssue() {
    try {
        console.log("🔍 Debugging Potential Deletion Issue...\n");

        // Find a test booking
        const testBooking = await Booking.findOne({
            where: { status: 'confirmed' },
            include: [{ model: BookingStatus, attributes: ['id', 'name'] }]
        });

        if (!testBooking) {
            console.log("❌ No confirmed booking found for testing");
            process.exit(1);
        }

        console.log(`📋 Test booking #${testBooking.id}:`);
        console.log(`   - Status: ${testBooking.status} (ID: ${testBooking.statusId})`);
        console.log(`   - User ID: ${testBooking.userId}`);

        // Get admin user
        const adminUser = await User.findOne({ where: { role: 'admin' } });
        if (!adminUser) {
            console.log("❌ No admin user found");
            process.exit(1);
        }

        // Test the exact scenario that might cause deletion
        console.log("\n🔄 Testing update with statusId...");
        
        const newStatus = await BookingStatus.findOne({ where: { name: 'completed' } });
        if (!newStatus) {
            console.log("❌ Completed status not found");
            process.exit(1);
        }

        const updateData = {
            status: newStatus.name,
            statusId: newStatus.id,
            totalPrice: testBooking.totalPrice + 50
        };

        console.log("Update data:", updateData);

        // Check booking count before update
        const bookingsBefore = await Booking.count();
        console.log(`\n📊 Bookings before update: ${bookingsBefore}`);

        // Perform the update using the service
        console.log("🔄 Calling bookingService.updateBooking...");
        const updatedBooking = await bookingService.updateBooking(
            testBooking.id,
            updateData,
            adminUser
        );

        // Check booking count after update
        const bookingsAfter = await Booking.count();
        console.log(`📊 Bookings after update: ${bookingsAfter}`);

        if (bookingsAfter < bookingsBefore) {
            console.log("❌ DELETION DETECTED! Booking count decreased!");
            console.log(`   Before: ${bookingsBefore}, After: ${bookingsAfter}`);
        } else if (bookingsAfter === bookingsBefore) {
            console.log("✅ No deletion - booking count unchanged");
        }

        // Check if the specific booking still exists
        const checkBooking = await Booking.findByPk(testBooking.id);
        if (!checkBooking) {
            console.log("❌ SPECIFIC BOOKING DELETED!");
            console.log(`   Booking #${testBooking.id} no longer exists`);
        } else {
            console.log("✅ Specific booking still exists");
            console.log(`   - Status: ${checkBooking.status}`);
            console.log(`   - Status ID: ${checkBooking.statusId}`);
            console.log(`   - Price: ${checkBooking.totalPrice}`);
        }

        // Test direct model update
        console.log("\n🔄 Testing direct model update...");
        const bookingsBeforeDirect = await Booking.count();
        
        const directUpdateData = {
            status: 'pending',
            statusId: 1
        };

        await Booking.update(directUpdateData, {
            where: { id: testBooking.id }
        });

        const bookingsAfterDirect = await Booking.count();
        console.log(`Direct update - Before: ${bookingsBeforeDirect}, After: ${bookingsAfterDirect}`);

        const checkDirectBooking = await Booking.findByPk(testBooking.id);
        if (!checkDirectBooking) {
            console.log("❌ Direct model update deleted the booking!");
        } else {
            console.log("✅ Direct model update preserved the booking");
        }

        // Test if there are any hooks that might cause deletion
        console.log("\n🔄 Checking for problematic hooks...");
        console.log("Booking model hooks:", Object.keys(Booking.hooks || {}));

        // Test the exact payload that frontend sends
        console.log("\n🔄 Testing exact frontend payload format...");
        const frontendPayload = {
            date: "2025-10-27",
            startTime: "10:00",
            endTime: "11:00",
            status: "completed",
            statusId: newStatus.id,
            totalPrice: 300,
            userId: testBooking.userId,
            venueId: testBooking.venueId
        };

        console.log("Frontend payload:", frontendPayload);
        
        const bookingsBeforeFrontend = await Booking.count();
        await bookingService.updateBooking(testBooking.id, frontendPayload, adminUser);
        const bookingsAfterFrontend = await Booking.count();
        
        console.log(`Frontend payload - Before: ${bookingsBeforeFrontend}, After: ${bookingsAfterFrontend}`);
        
        const finalCheck = await Booking.findByPk(testBooking.id);
        if (!finalCheck) {
            console.log("❌ Frontend payload format caused deletion!");
        } else {
            console.log("✅ Frontend payload format preserved the booking");
        }

        console.log("\n🎯 Debugging complete!");
        
    } catch (error) {
        console.error("❌ Debugging failed:", error);
        process.exit(1);
    }
}

debugDeletionIssue();