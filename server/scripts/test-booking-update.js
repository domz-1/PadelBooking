#!/usr/bin/env node

const { sequelize } = require("../src/config/database");
const Booking = require("../src/modules/bookings/booking.model");
const BookingStatus = require("../src/modules/settings/bookingStatus.model");
const User = require("../src/modules/users/user.model");
const Venue = require("../src/modules/venues/venue.model");

async function testBookingUpdate() {
    try {
        console.log("🧪 Testing Booking Update Functionality...\n");

        // Find a booking to update
        const testBooking = await Booking.findOne({
            include: [
                { model: BookingStatus, attributes: ['id', 'name', 'color'] },
                { model: User, attributes: ['id', 'name'] },
                { model: Venue, attributes: ['id', 'name'] }
            ],
            where: { status: 'confirmed' }
        });

        if (!testBooking) {
            console.log("❌ No confirmed booking found for testing");
            process.exit(1);
        }

        console.log(`📋 Found test booking #${testBooking.id}:`);
        console.log(`   - Status: ${testBooking.status} (ID: ${testBooking.statusId})`);
        console.log(`   - User: ${testBooking.User?.name} (ID: ${testBooking.userId})`);
        console.log(`   - Venue: ${testBooking.Venue?.name} (ID: ${testBooking.venueId})`);
        console.log(`   - Date: ${testBooking.date}, Time: ${testBooking.startTime} - ${testBooking.endTime}`);

        // Get a different status for update
        const newStatus = await BookingStatus.findOne({
            where: { name: 'completed' }
        });

        if (!newStatus) {
            console.log("❌ No 'completed' status found");
            process.exit(1);
        }

        console.log(`\n🔄 Updating booking status to: ${newStatus.name} (ID: ${newStatus.id})`);

        // Update the booking (simulating what the edit dialog does)
        const updateData = {
            status: newStatus.name,
            statusId: newStatus.id,
            totalPrice: testBooking.totalPrice + 50 // Increase price by 50
        };

        console.log("   Update data:", updateData);

        // Perform the update
        const [updatedCount, updatedBookings] = await Booking.update(updateData, {
            where: { id: testBooking.id },
            returning: true
        });

        console.log(`\n✅ Update result: ${updatedCount} rows updated`);

        if (updatedCount !== 1) {
            console.log("❌ Expected 1 row to be updated");
            process.exit(1);
        }

        // Fetch the updated booking
        const updatedBooking = await Booking.findByPk(testBooking.id, {
            include: [
                { model: BookingStatus, attributes: ['id', 'name', 'color'] },
                { model: User, attributes: ['id', 'name'] },
                { model: Venue, attributes: ['id', 'name'] }
            ]
        });

        if (!updatedBooking) {
            console.log("❌ Booking was deleted during update!");
            process.exit(1);
        }

        console.log(`\n📋 Updated booking #${updatedBooking.id}:`);
        console.log(`   - Status: ${updatedBooking.status} (ID: ${updatedBooking.statusId})`);
        console.log(`   - Status Color: ${updatedBooking.BookingStatus?.color}`);
        console.log(`   - Price: ${updatedBooking.totalPrice} (was ${testBooking.totalPrice})`);
        console.log(`   - User: ${updatedBooking.User?.name} (ID: ${updatedBooking.userId})`);
        console.log(`   - Venue: ${updatedBooking.Venue?.name} (ID: ${updatedBooking.venueId})`);

        // Verify the update was successful
        const verification = {
            statusUpdated: updatedBooking.status === newStatus.name,
            statusIdUpdated: updatedBooking.statusId === newStatus.id,
            priceUpdated: updatedBooking.totalPrice === testBooking.totalPrice + 50,
            userPreserved: updatedBooking.userId === testBooking.userId,
            venuePreserved: updatedBooking.venueId === testBooking.venueId,
            datePreserved: updatedBooking.date === testBooking.date,
            timesPreserved: updatedBooking.startTime === testBooking.startTime && updatedBooking.endTime === testBooking.endTime
        };

        console.log("\n🔍 Verification:");
        console.log(`   ✅ Status updated: ${verification.statusUpdated}`);
        console.log(`   ✅ Status ID updated: ${verification.statusIdUpdated}`);
        console.log(`   ✅ Price updated: ${verification.priceUpdated}`);
        console.log(`   ✅ User preserved: ${verification.userPreserved}`);
        console.log(`   ✅ Venue preserved: ${verification.venuePreserved}`);
        console.log(`   ✅ Date preserved: ${verification.datePreserved}`);
        console.log(`   ✅ Times preserved: ${verification.timesPreserved}`);

        const allChecksPassed = Object.values(verification).every(v => v === true);

        if (allChecksPassed) {
            console.log("\n🎉 All update tests passed! Booking was properly updated without deletion.");
            console.log("\n📊 Summary:");
            console.log("   - Booking update functionality: ✅ WORKING");
            console.log("   - Status ID preservation: ✅ WORKING");
            console.log("   - Data integrity: ✅ MAINTAINED");
            console.log("   - No unintended deletion: ✅ CONFIRMED");
        } else {
            console.log("\n❌ Some verification checks failed!");
            process.exit(1);
        }

        // Test multiple updates to ensure consistency
        console.log("\n🔁 Testing multiple updates...");
        
        const statusesToTest = ['pending', 'cancelled'];
        for (const statusName of statusesToTest) {
            const testStatus = await BookingStatus.findOne({ where: { name: statusName } });
            if (testStatus) {
                await Booking.update(
                    { status: testStatus.name, statusId: testStatus.id },
                    { where: { id: testBooking.id } }
                );
                
                const checkBooking = await Booking.findByPk(testBooking.id);
                if (checkBooking && checkBooking.status === testStatus.name) {
                    console.log(`   ✅ Update to '${statusName}' successful`);
                } else {
                    console.log(`   ❌ Update to '${statusName}' failed`);
                }
            }
        }

        // Final check - ensure booking still exists
        const finalCheck = await Booking.findByPk(testBooking.id);
        if (finalCheck) {
            console.log(`\n✅ Final verification: Booking #${testBooking.id} still exists after multiple updates`);
        } else {
            console.log(`\n❌ Final verification failed: Booking #${testBooking.id} was deleted!`);
            process.exit(1);
        }

        console.log("\n🎯 Booking update functionality is working correctly!");
        process.exit(0);
        
    } catch (error) {
        console.error("❌ Update test failed:", error);
        process.exit(1);
    }
}

testBookingUpdate();