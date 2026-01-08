const Branch = require('../src/modules/branches/branch.model');
const Venue = require('../src/modules/venues/venue.model');
const Booking = require('../src/modules/bookings/booking.model');
const BookingStatus = require('../src/modules/settings/bookingStatus.model');
const { sequelize } = require('../src/config/database');

async function verify() {
    try {
        const venues = await Venue.findAll();
        const branches = await Branch.findAll({ order: [['id', 'ASC']] });
        const branchMap = {};

        console.log('\n--- Branch Order ---');
        branches.forEach(b => {
            branchMap[b.id] = b.name;
            console.log(`ID: ${b.id} | Name: ${b.name}`);
        });

        console.log('\n--- Venue Distribution & Booking Counts ---');
        for (const v of venues) {
            const count = await Booking.count({ where: { venueId: v.id } });
            console.log(`Venue: ${v.name.padEnd(20)} | Branch: ${branchMap[v.branchId].padEnd(15)} | Bookings: ${count}`);
        }

        console.log('\n--- Booking Status Distribution ---');
        const statuses = await BookingStatus.findAll();
        for (const s of statuses) {
            const count = await Booking.count({ where: { statusId: s.id } });
            console.log(`Status: ${s.name.padEnd(10)} | ID: ${s.id} | Color: ${s.color} | Count: ${count}`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verify();
