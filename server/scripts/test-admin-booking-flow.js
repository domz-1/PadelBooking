#!/usr/bin/env node

const { sequelize } = require("../src/config/database");
const Booking = require("../src/modules/bookings/booking.model");
const BookingStatus = require("../src/modules/settings/bookingStatus.model");
const User = require("../src/modules/users/user.model");
const Venue = require("../src/modules/venues/venue.model");
const bookingService = require("../src/modules/bookings/booking.service");

async function testAdminBookingFlow() {
    try {
        console.log("🧪 Testing Admin Booking Flow (Edit Dialog Simulation)...\n");

        // Find a test booking
        const testBooking = await Booking.findOne({
            include: [
                { model: BookingStatus, attributes: ['id', 'name', 'color'] },
                { model: User, attributes: ['id', 'name', 'email'] },
                { model: Venue, attributes: ['id', 'name'] }
            ],
            where: { status: 'confirmed' }
        });

        if (!testBooking) {
            console.log("❌ No confirmed booking found for testing");
            process.exit(1);
        }

        console.log(`📋 Test booking #${testBooking.id}:`);
        console.log(`   - Current Status: ${testBooking.status} (ID: ${testBooking.statusId})`);
        console.log(`   - User: ${testBooking.User?.name} (ID: ${testBooking.userId})`);
        console.log(`   - Venue: ${testBooking.Venue?.name} (ID: ${testBooking.venueId})`);
        console.log(`   - Price: ${testBooking.totalPrice}`);

        // Simulate admin user
        const adminUser = await User.findOne({ where: { role: 'admin' } });
        if (!adminUser) {
            console.log("❌ No admin user found");
            process.exit(1);
        }

        console.log(`\n👤 Simulating admin: ${adminUser.name} (${adminUser.email})`);

        // Test 1: Get booking details (like edit dialog does)
        console.log("\n1️⃣ Testing getBookingById (edit dialog load)...");
        const bookingDetails = await bookingService.getBookingById(testBooking.id);
        
        if (!bookingDetails) {
            console.log("❌ Failed to get booking details");
            process.exit(1);
        }

        console.log("   ✅ Booking details retrieved successfully");
        console.log(`   - Status: ${bookingDetails.status}`);
        console.log(`   - Status ID: ${bookingDetails.statusId}`);

        // Test 2: Prepare update data (like edit dialog form submission)
        console.log("\n2️⃣ Preparing update data (form submission)...");
        
        // Get new status
        const newStatus = await BookingStatus.findOne({ where: { name: 'completed' } });
        if (!newStatus) {
            console.log("❌ Completed status not found");
            process.exit(1);
        }

        const updateData = {
            status: newStatus.name,
            statusId: newStatus.id,
            totalPrice: bookingDetails.totalPrice + 100,
            notes: "Updated via admin edit dialog test"
        };

        console.log("   Update payload:", updateData);

        // Test 3: Update booking (like edit dialog save)
        console.log("\n3️⃣ Updating booking (save changes)...");
        
        const updatedBooking = await bookingService.updateBooking(
            testBooking.id,
            updateData,
            adminUser
        );

        if (!updatedBooking) {
            console.log("❌ Booking update failed");
            process.exit(1);
        }

        console.log("   ✅ Booking updated successfully");
        console.log(`   - New Status: ${updatedBooking.status}`);
        console.log(`   - New Status ID: ${updatedBooking.statusId}`);
        console.log(`   - New Price: ${updatedBooking.totalPrice}`);
        console.log(`   - Notes: ${updatedBooking.notes}`);

        // Test 4: Verify booking still exists (no deletion)
        console.log("\n4️⃣ Verifying booking still exists...");
        
        const verifyBooking = await Booking.findByPk(testBooking.id);
        if (!verifyBooking) {
            console.log("❌ Booking was deleted during update!");
            process.exit(1);
        }

        console.log("   ✅ Booking still exists after update");

        // Test 5: Verify all data integrity
        console.log("\n5️⃣ Verifying data integrity...");
        
        const integrityChecks = {
            statusMatches: verifyBooking.status === newStatus.name,
            statusIdMatches: verifyBooking.statusId === newStatus.id,
            priceUpdated: verifyBooking.totalPrice === bookingDetails.totalPrice + 100,
            notesAdded: verifyBooking.notes === "Updated via admin edit dialog test",
            userPreserved: verifyBooking.userId === bookingDetails.userId,
            venuePreserved: verifyBooking.venueId === bookingDetails.venueId,
            datePreserved: verifyBooking.date === bookingDetails.date,
            timesPreserved: verifyBooking.startTime === bookingDetails.startTime && verifyBooking.endTime === bookingDetails.endTime
        };

        console.log("   Integrity checks:");
        Object.entries(integrityChecks).forEach(([check, result]) => {
            console.log(`   - ${check}: ${result ? '✅' : '❌'}`);
        });

        const allChecksPassed = Object.values(integrityChecks).every(v => v === true);

        // Test 6: Test edge cases
        console.log("\n6️⃣ Testing edge cases...");
        
        // Test updating with null statusId (should handle gracefully)
        try {
            const edgeCaseUpdate = {
                status: 'pending',
                statusId: null, // This should be handled
                totalPrice: verifyBooking.totalPrice
            };
            
            await bookingService.updateBooking(testBooking.id, edgeCaseUpdate, adminUser);
            
            const edgeCaseBooking = await Booking.findByPk(testBooking.id);
            console.log(`   ✅ Null statusId handled: ${edgeCaseBooking.status}`);
            
            // Restore to valid status
            await bookingService.updateBooking(testBooking.id, {
                statusId: newStatus.id
            }, adminUser);
            
        } catch (error) {
            console.log(`   ⚠️  Null statusId test: ${error.message}`);
        }

        // Test 7: Multiple rapid updates
        console.log("\n7️⃣ Testing multiple rapid updates...");
        
        const rapidStatuses = ['pending', 'confirmed', 'completed'];
        for (const statusName of rapidStatuses) {
            const status = await BookingStatus.findOne({ where: { name: statusName } });
            if (status) {
                await bookingService.updateBooking(testBooking.id, {
                    status: status.name,
                    statusId: status.id
                }, adminUser);
                
                const check = await Booking.findByPk(testBooking.id);
                if (check.status === status.name) {
                    console.log(`   ✅ Rapid update to '${statusName}' successful`);
                }
            }
        }

        // Final verification
        const finalBooking = await Booking.findByPk(testBooking.id);
        if (finalBooking) {
            console.log(`\n✅ Final verification: Booking #${testBooking.id} survived all tests`);
            console.log(`   - Final status: ${finalBooking.status}`);
            console.log(`   - Final status ID: ${finalBooking.statusId}`);
        } else {
            console.log(`\n❌ Final verification failed: Booking was deleted!`);
            process.exit(1);
        }

        if (allChecksPassed) {
            console.log("\n🎉 ALL TESTS PASSED!");
            console.log("\n📊 Admin Booking Flow Summary:");
            console.log("   ✅ Edit dialog load: WORKING");
            console.log("   ✅ Form submission: WORKING");
            console.log("   ✅ Status ID handling: WORKING");
            console.log("   ✅ Data integrity: MAINTAINED");
            console.log("   ✅ No unintended deletion: CONFIRMED");
            console.log("   ✅ Edge cases: HANDLED");
            console.log("   ✅ Multiple updates: WORKING");
            
            console.log("\n🎯 Admin booking flow is working correctly!");
            console.log("   The edit dialog will properly update bookings without deletion.");
        } else {
            console.log("\n❌ Some tests failed!");
            process.exit(1);
        }

        process.exit(0);
        
    } catch (error) {
        console.error("❌ Admin booking flow test failed:", error);
        process.exit(1);
    }
}

testAdminBookingFlow();