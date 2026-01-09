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

function isEmptyRow(row) {
    if (!row) return true;
    return Object.values(row).every(value => value === null || value === undefined || String(value).trim() === '');
}


async function processUsers(data, res) {
    let createdCount = 0;
    let updatedCount = 0;
    let errors = [];

    for (const [index, row] of data.entries()) {
        const rowNum = index + 2; // header is 1
        try {
            if (isEmptyRow(row)) continue;

            if (!row.email || !row.name) {
                errors.push(`Row ${rowNum}: Missing email or name`);
                continue;
            }

            if (!isValidEmail(row.email)) {
                errors.push(`Row ${rowNum}: Invalid email format (${row.email})`);
                continue;
            }

            let user = await User.findOne({ where: { email: row.email } });

            if (user) {
                await user.update({
                    name: row.name,
                    phone: row.phone || user.phone,
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
        } catch (err) {
            errors.push(`Row ${rowNum}: Error processing user - ${err.message}`);
        }
    }

    const hasErrors = errors.length > 0;
    const totalProcessed = createdCount + updatedCount;

    res.status(hasErrors && totalProcessed === 0 ? 400 : 200).json({
        success: !(hasErrors && totalProcessed === 0),
        message: `Import processed. Created: ${createdCount}, Updated: ${updatedCount}, Errors: ${errors.length}`,
        errors: errors.length > 0 ? errors : undefined,
        summary: {
            total: data.length,
            created: createdCount,
            updated: updatedCount,
            failed: errors.length
        }
    });
}

async function processBookings(data, res) {
    let count = 0;
    let errors = [];

    for (const [index, row] of data.entries()) {
        const rowNum = index + 2;

        try {
            if (isEmptyRow(row)) continue;

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
                    errors.push(`Row ${rowNum}: User '${row.userEmail}' not found and missing phone to create account.`);
                    continue;
                }
            }

            // 4. Create Booking
            // Check for overlap slightly better locally if needed, but DB constraint is safer if added.
            const existing = await Booking.findOne({
                where: {
                    venueId: venue.id,
                    date: row.date,
                    startTime: row.startTime // Simplified check, ideally range check
                }
            });

            if (existing) {
                errors.push(`Row ${rowNum}: Slot already booked at ${row.startTime} for ${row.venueName}`);
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
        } catch (err) {
            errors.push(`Row ${rowNum}: Import failed - ${err.message}`);
        }
    }

    const hasErrors = errors.length > 0;
    res.status(hasErrors && count === 0 ? 400 : 200).json({
        success: !(hasErrors && count === 0),
        message: `${count} bookings imported successfully with ${errors.length} errors`,
        errors: errors.length > 0 ? errors : undefined,
        importSummary: {
            totalRows: data.length,
            successCount: count,
            failedCount: errors.length
        }
    });
}
