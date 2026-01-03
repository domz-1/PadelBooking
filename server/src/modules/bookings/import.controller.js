const Booking = require('./booking.model');
const User = require('../users/user.model');
const Venue = require('../venues/venue.model');
const Branch = require('../branches/branch.model');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const fs = require('fs');
const bcrypt = require('bcryptjs');

exports.importExcel = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        const type = req.body.type; // 'users' or 'bookings'
        const filePath = req.file.path;
        let data = [];

        if (req.file.mimetype === 'text/csv' || req.file.mimetype === 'application/vnd.ms-excel') {
            const results = [];
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', async () => {
                    await handleImport(type, results, res);
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                });
        } else {
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            data = xlsx.utils.sheet_to_json(sheet);
            await handleImport(type, data, res);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        next(error);
    }
};

async function handleImport(type, data, res) {
    if (type === 'users') {
        await processUsers(data, res);
    } else if (type === 'bookings') {
        await processBookings(data, res);
    } else {
        res.status(400).json({ success: false, message: 'Invalid import type' });
    }
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function isValidDate(dateString) {
    // Check YYYY-MM-DD
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}

function isValidTime(timeString) {
    // Check HH:mm or HH:mm:ss
    const regex = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;
    return regex.test(timeString);
}


async function processUsers(data, res) {
    let createdCount = 0;
    let updatedCount = 0;
    let errors = [];

    for (const [index, row] of data.entries()) {
        const rowNum = index + 2; // header is 1
        if (!row.email || !row.name) {
            errors.push(`Row ${rowNum}: Missing email or name`);
            continue;
        }

        if (!isValidEmail(row.email)) {
            errors.push(`Row ${rowNum}: Invalid email format`);
            continue;
        }

        let user = await User.findOne({ where: { email: row.email } });

        if (user) {
            await user.update({
                name: row.name,
                phoneNumber: row.phone || user.phoneNumber,
            });
            updatedCount++;
        } else {
            const phoneStr = row.phone ? String(row.phone) : '00000000';
            const lastThree = phoneStr.slice(-3);
            const plainPassword = `${row.email}${lastThree}`;

            await User.create({
                name: row.name,
                email: row.email,
                phone: row.phone,
                password: plainPassword,
                role: row.role || 'user',
                isPublic: true
            });
            createdCount++;
        }
    }

    res.status(200).json({
        success: true,
        message: `Processed users. Created: ${createdCount}, Updated: ${updatedCount}`,
        errors: errors.length > 0 ? errors : undefined
    });
}

async function processBookings(data, res) {
    let count = 0;
    let errors = [];

    for (const [index, row] of data.entries()) {
        const rowNum = index + 2;

        if (!row.venueName || !row.date || !row.startTime || !row.endTime) {
            errors.push(`Row ${rowNum}: Missing required fields (venueName, date, startTime, endTime)`);
            continue;
        }

        if (!isValidDate(row.date)) {
            errors.push(`Row ${rowNum}: Invalid date format (YYYY-MM-DD required)`);
            continue;
        }

        if (!isValidTime(row.startTime) || !isValidTime(row.endTime)) {
            errors.push(`Row ${rowNum}: Invalid time format (HH:mm required)`);
            continue;
        }

        // 1. Find or Create Branch
        let branch = null;
        if (row.branchName) {
            branch = await Branch.findOne({ where: { name: row.branchName } });
            if (!branch) {
                branch = await Branch.create({ name: row.branchName, location: 'Imported', isActive: true });
            }
        }

        // 2. Find or Create Venue
        let venue = await Venue.findOne({ where: { name: row.venueName } });

        if (!venue) {
            if (branch) {
                venue = await Venue.create({
                    name: row.venueName,
                    branchId: branch.id,
                    pricePerHour: row.price || 100,
                    location: branch.location || 'Unknown',
                    type: 'indoor'
                });
            } else {
                errors.push(`Row ${rowNum}: Venue '${row.venueName}' not found and no branch provided to create it.`);
                continue;
            }
        }

        // 3. Find or Create User
        let user = null;
        if (row.userEmail) {
            user = await User.findOne({ where: { email: row.userEmail } });
            if (!user && row.userPhone) {
                const phoneStr = String(row.userPhone);
                const lastThree = phoneStr.slice(-3);
                const plainPassword = `${row.userEmail}${lastThree}`;

                user = await User.create({
                    name: row.userName || 'Imported User',
                    email: row.userEmail,
                    password: plainPassword,
                    role: 'user'
                });
            } else if (!user) {
                // If user doesn't exist and can't be created (no phone), we can maybe assign to null if system allows?
                // But usually we need a user.
                // If the system allows anonymous bookings (admin created), maybe we just use admin ID or null?
                // For now, let's treat as error if userEmail is provided but user not found/creatable
                errors.push(`Row ${rowNum}: User '${row.userEmail}' not found and insufficient data to create.`);
                continue;
            }
        }

        // 4. Create Booking
        try {
            // Check for overlap slightly better locally if needed, but DB constraint is safer if added.
            const existing = await Booking.findOne({
                where: {
                    venueId: venue.id,
                    date: row.date,
                    startTime: row.startTime // Simplified check, ideally range check
                }
            });

            if (existing) {
                errors.push(`Row ${rowNum}: Slot already booked`);
                continue;
            }

            await Booking.create({
                userId: user ? user.id : (res.locals.user ? res.locals.user.id : null), // Fallback to current admin or null
                venueId: venue.id,
                date: row.date,
                startTime: row.startTime,
                endTime: row.endTime,
                totalPrice: row.price || venue.pricePerHour,
                status: 'confirmed',
                type: 'standard'
            });
            count++;
        } catch (e) {
            errors.push(`Row ${rowNum}: Error creating booking - ${e.message}`);
        }
    }

    res.status(200).json({
        success: true,
        message: `${count} bookings imported successfully`,
        errors: errors.length > 0 ? errors : undefined,
        importSummary: {
            totalRows: data.length,
            successCount: count,
            failedCount: errors.length
        }
    });
}
