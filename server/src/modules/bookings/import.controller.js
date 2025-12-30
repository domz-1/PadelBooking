const Booking = require('./booking.model');
const User = require('../users/user.model');
const Venue = require('../venues/venue.model');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const fs = require('fs');

exports.importBookings = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        const bookings = [];
        const filePath = req.file.path;

        if (req.file.mimetype === 'text/csv') {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (row) => bookings.push(row))
                .on('end', async () => {
                    await processBookings(bookings, req, res);
                    fs.unlinkSync(filePath);
                });
        } else {
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(sheet);
            await processBookings(data, req, res);
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        next(error);
    }
};

async function processBookings(data, req, res) {
    let count = 0;
    for (const row of data) {
        // Expected format: email, venueName, date, startTime, endTime, price
        const user = await User.findOne({ where: { email: row.email } });
        const venue = await Venue.findOne({ where: { name: row.venueName } });

        if (user && venue) {
            await Booking.create({
                userId: user.id,
                venueId: venue.id,
                date: row.date,
                startTime: row.startTime,
                endTime: row.endTime,
                totalPrice: row.price,
                status: 'confirmed'
            });
            count++;
        }
    }
    res.status(200).json({ success: true, message: `${count} bookings imported successfully` });
}
