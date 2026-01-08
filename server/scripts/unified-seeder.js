const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { sequelize } = require("../src/config/database");
const bcrypt = require("bcryptjs");

// Models
const User = require("../src/modules/users/user.model");
const Branch = require("../src/modules/branches/branch.model");
const Venue = require("../src/modules/venues/venue.model");
const Booking = require("../src/modules/bookings/booking.model");
const Sport = require("../src/modules/sports/sport.model");
const Sponsor = require("../src/modules/sponsors/sponsor.model");
const Product = require("../src/modules/store/product.model");
const Coach = require("../src/modules/coaches/coach.model");
const BookingStatus = require("../src/modules/settings/bookingStatus.model");

const cleanName = (name) => {
    // Remove emojis, special characters, and extra spaces for cleaner internal names
    return name
        .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]|\uD83D[\uDE80-\uDEFF]|[^\w\s-])/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

const parseVenueName = (venueStr) => {
    if (!venueStr || typeof venueStr !== 'string') {
        return { name: '', branch: '' };
    }

    let branch = '';
    let name = cleanName(venueStr);

    // 1. Check for Color Indicators (🔴 = El Giesh St, ⚪ = Ring Road)
    if (venueStr.includes('🔴')) {
        branch = 'El Giesh St';
    } else if (venueStr.includes('⚪')) {
        branch = 'Ring Road';
    }

    // 2. Extract from Parentheses if available
    const match = venueStr.match(/([^()]+)\s*\(([^)]+)\)/);
    if (match) {
        name = cleanName(match[1].trim());
        const parenthesesContent = match[2].trim().toLowerCase();

        // If branch wasn't set by emoji, or use it to confirm/override
        if (parenthesesContent.includes('giesh st')) {
            branch = 'El Giesh St';
        } else if (parenthesesContent.includes('ring road')) {
            branch = 'Ring Road';
        }
    }

    // 3. Last Resort Fallbacks from name string
    if (!branch) {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('elgiesh') || lowerName.includes('el giesh')) {
            branch = 'El Giesh St';
        } else if (lowerName.includes('ring road')) {
            branch = 'Ring Road';
        }
    }

    return { name, branch };
};

const seedDatabase = async () => {
    try {
        console.log("🌱 Starting unified seed process...");

        // Connect to database
        await sequelize.authenticate();
        console.log("✅ Connected to database");

        // Sync database (force: true will drop and recreate tables)
        await sequelize.sync({ force: true });
        console.log("🔄 Database synced successfully");

        const PLAIN_PASSWORD = "password123";
        const passwordHash = await bcrypt.hash(PLAIN_PASSWORD, 10);

        // ============================================
        // 1. SEED BRANCHES (from code)
        // ============================================
        console.log("\n📍 Seeding branches...");

        const branchesData = [
            {
                name: "Ring Road",
                location: "Ring Road, Cairo",
                description: "State-of-the-art padel courts with panoramic views",
                isActive: true,
                phone: "+20 10 00000002",
                email: "ringroad@padel.com"
            },
            {
                name: "El Giesh St",
                location: "El Giesh Street, Cairo",
                description: "Premium padel facilities in the heart of Cairo",
                isActive: true,
                phone: "+20 10 00000001",
                email: "elgiesh@padel.com"
            }
        ];

        const branchesMap = {};
        for (const branchData of branchesData) {
            const branch = await Branch.create(branchData);
            branchesMap[branchData.name.toLowerCase().trim()] = branch.id;
            console.log(`   ✅ Created branch: ${branch.name}`);
        }

        // ============================================
        // 2. SEED BOOKING STATUSES
        // ============================================
        console.log("\n🎨 Seeding booking statuses...");

        const statusesData = [
            { name: "Pending", color: "#F59E0B", isDefault: true },
            { name: "Confirmed", color: "#10B981", isDefault: false },
            { name: "Cancelled", color: "#EF4444", isDefault: false },
            { name: "Completed", color: "#3B82F6", isDefault: false },
            { name: "No Show", color: "#6B7280", isDefault: false }
        ];

        const statusesMap = {};
        for (const statusData of statusesData) {
            const status = await BookingStatus.create(statusData);
            statusesMap[status.name.toLowerCase()] = status.id;
            console.log(`   ✅ Created status: ${status.name}`);
        }

        // ============================================
        // 3. SEED VENUES (from code)
        // ============================================
        console.log("\n🏟️  Seeding venues...");

        const venuesData = [
            // El Giesh St venues
            { name: "Center Court", branch: "El Giesh St", pricePerHour: 300, type: "Indoor" },
            { name: "Court 1", branch: "El Giesh St", pricePerHour: 250, type: "Outdoor" },
            { name: "Court 2", branch: "El Giesh St", pricePerHour: 250, type: "Outdoor" },
            { name: "Panoramic Court", branch: "El Giesh St", pricePerHour: 350, type: "Indoor" },

            // Ring Road venues
            { name: "Court 1", branch: "Ring Road", pricePerHour: 250, type: "Outdoor" },
            { name: "Court 2", branch: "Ring Road", pricePerHour: 250, type: "Outdoor" },
            { name: "Solo Padel", branch: "Ring Road", pricePerHour: 200, type: "Outdoor" }
        ];

        const venuesMap = {};
        for (const venueData of venuesData) {
            const branchId = branchesMap[venueData.branch.toLowerCase().trim()];
            if (!branchId) {
                console.log(`   ⚠️  Skipping venue ${venueData.name} - branch not found`);
                continue;
            }

            const venue = await Venue.create({
                name: venueData.name,
                description: `Premium ${venueData.type.toLowerCase()} court at ${venueData.branch}`,
                location: venueData.branch,
                pricePerHour: venueData.pricePerHour,
                courts: 1,
                contactEmail: "contact@padel.com",
                contactPhone: "12345678",
                amenities: ["Lighting", "AC", "Parking"],
                branchId: branchId,
                type: venueData.type,
                images: ["seeds/sport_1.png"]
            });

            // Store lookup key as "venue_name|branch_name" for absolute uniqueness
            const lookupKey = `${venueData.name.toLowerCase().trim()}|${venueData.branch.toLowerCase().trim()}`;
            venuesMap[lookupKey] = venue.id;
            console.log(`   ✅ Created venue: ${venueData.name} (${venueData.branch})`);
        }

        // ============================================
        // 4. SEED USERS (from CSV)
        // ============================================
        console.log("\n👥 Seeding users from CSV...");

        const usersMap = {};
        const usersFromCSV = [];

        // Read users from bookings CSV
        const bookingsCSVPath = path.join(__dirname, "../seeds/bookings.csv");
        if (!fs.existsSync(bookingsCSVPath)) {
            throw new Error(`Bookings CSV file not found at ${bookingsCSVPath}`);
        }

        // First pass: collect all unique users from bookings CSV
        const userEmails = new Set();

        await new Promise((resolve, reject) => {
            fs.createReadStream(bookingsCSVPath)
                .pipe(csv())
                .on('data', (row) => {
                    if (row['Holder email'] && row['Holder email'].trim()) {
                        const email = row['Holder email'].toLowerCase().trim();
                        if (email && !userEmails.has(email)) {
                            userEmails.add(email);

                            // Extract user info from CSV
                            const firstName = row['Holder first name'] || 'Unknown';
                            const lastName = row['Holder last name'] || 'User';
                            const phone = row['Holder telephone'] || '00000000';

                            usersFromCSV.push({
                                firstName: firstName.trim(),
                                lastName: lastName.trim(),
                                phone: phone.replace(/[^0-9+]/g, '').trim(),
                                email: email
                            });
                        }
                    }
                })
                .on('end', resolve)
                .on('error', reject);
        });

        console.log(`   📊 Found ${usersFromCSV.length} unique users in bookings CSV`);

        // Create admin user first
        const admin = await User.create({
            name: "Admin User",
            email: "admin@padel.com",
            password: passwordHash,
            role: "admin",
            phone: "1234567890"
        }, { hooks: false });
        usersMap["admin@padel.com"] = admin.id;
        console.log(`   ✅ Created admin user: ${admin.email}`);

        // Create coach user
        const coachUser = await User.create({
            name: "Ahmed Coach",
            email: "coach.ahmed@padel.com",
            password: passwordHash,
            role: "coach",
            phone: "01012345678"
        }, { hooks: false });
        usersMap["coach.ahmed@padel.com"] = coachUser.id;
        console.log(`   ✅ Created coach user: ${coachUser.email}`);

        // Create regular users from CSV
        const userRecords = usersFromCSV.map(u => ({
            name: `${u.firstName} ${u.lastName}`.trim() || "Unknown User",
            email: u.email.toLowerCase().trim(),
            password: passwordHash,
            role: "user",
            phone: u.phone || "00000000"
        }));

        await User.bulkCreate(userRecords, {
            ignoreDuplicates: true,
            hooks: false
        });

        // Refresh map with created users
        const allUsers = await User.findAll({ attributes: ['id', 'email'] });
        allUsers.forEach(u => {
            usersMap[u.email.toLowerCase().trim()] = u.id;
        });

        console.log(`   ✅ Created ${Object.keys(usersMap).length} total users`);

        // ============================================
        // 5. SEED BOOKINGS (from CSV)
        // ============================================
        console.log("\n📅 Seeding bookings from CSV...");

        const bookingsFromCSV = [];
        let csvRowCount = 0;
        let validBookingCount = 0;
        let skippedCount = 0;

        await new Promise((resolve, reject) => {
            fs.createReadStream(bookingsCSVPath)
                .pipe(csv({ mapHeaders: ({ header }) => header.replace(/[^a-zA-Z0-9\s]/g, '').trim() }))
                .on('data', (row) => {
                    csvRowCount++;

                    // Skip header row (BOM character causes issues)
                    if (row['Scheduled start'] && row['Scheduled start'].includes('Scheduled start')) {
                        return;
                    }

                    // Skip invalid or empty bookings
                    if (!row['Scheduled start'] || !row['Spaces'] ||
                        !row['Holder email'] || row['Holder email'].trim() === '') {
                        skippedCount++;
                        return;
                    }

                    const userEmail = row['Holder email'].toLowerCase().trim();
                    const venueInfo = parseVenueName(row['Spaces']);

                    console.log(`   📄 Processing booking: ${row['Scheduled start']} - ${userEmail} - ${row['Spaces']}`);

                    // Find venue ID
                    const venueKey = `${venueInfo.name.toLowerCase().trim()}|${venueInfo.branch.toLowerCase().trim()}`;
                    const venueId = venuesMap[venueKey];

                    if (!venueId) {
                        console.log(`   ❌ Skipping - venue not found: ${venueInfo.name} @ ${venueInfo.branch} (key: ${venueKey})`);
                        console.log(`   Available venues: ${Object.keys(venuesMap).join(', ')}`);
                        skippedCount++;
                        return;
                    }

                    const userId = usersMap[userEmail];
                    if (!userId) {
                        console.log(`   ❌ Skipping - user not found: ${userEmail}`);
                        skippedCount++;
                        return;
                    }

                    // Parse dates and times with better error handling
                    let startDateTime, endDateTime;
                    try {
                        startDateTime = new Date(row['Scheduled start']);
                        endDateTime = new Date(row['End']);

                        if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
                            console.log(`   ❌ Skipping - invalid date format: ${row['Scheduled start']} / ${row['End']}`);
                            skippedCount++;
                            return;
                        }
                    } catch (dateError) {
                        console.log(`   ❌ Skipping - date parsing error: ${dateError.message}`);
                        skippedCount++;
                        return;
                    }

                    // Format date and time
                    const dateStr = startDateTime.toISOString().split('T')[0];
                    const startTime = startDateTime.toTimeString().split(' ')[0].substring(0, 5);
                    const endTime = endDateTime.toTimeString().split(' ')[0].substring(0, 5);

                    console.log(`   ✅ Valid booking: ${dateStr} ${startTime}-${endTime}`);

                    // Calculate price
                    const price = parseFloat(row['Price']) || 250;

                    // Map status
                    const isPaid = row['Payment status'] === 'Paid';
                    const statusName = isPaid ? 'confirmed' : 'pending';
                    const statusId = statusesMap[statusName];

                    bookingsFromCSV.push({
                        date: dateStr,
                        startTime: startTime,
                        endTime: endTime,
                        venueId: venueId,
                        userId: userId,
                        status: statusName,
                        statusId: statusId,
                        totalPrice: price,
                        type: "standard",
                        paymentMethod: row['Type'] === 'Instapay' ? 'instapay' : 'cash',
                        notes: row['Title'] || ''
                    });

                    validBookingCount++;
                })
                .on('end', resolve)
                .on('error', reject);
        });

        console.log(`   📊 Processed ${csvRowCount} CSV rows`);
        console.log(`   ✅ Valid bookings: ${validBookingCount}`);
        console.log(`   ⚠️  Skipped bookings: ${skippedCount}`);

        // Create bookings in chunks
        const CHUNK_SIZE = 500;
        for (let i = 0; i < bookingsFromCSV.length; i += CHUNK_SIZE) {
            const chunk = bookingsFromCSV.slice(i, i + CHUNK_SIZE);
            await Booking.bulkCreate(chunk);
            console.log(`   📝 Created ${Math.min(i + CHUNK_SIZE, bookingsFromCSV.length)} / ${bookingsFromCSV.length} bookings...`);
        }

        // ============================================
        // 5. SEED ADDITIONAL DATA
        // ============================================

        // Seed Sports
        console.log("\n🎾 Seeding sports...");
        await Sport.bulkCreate([
            {
                name: "Padel",
                icon: "seeds/sport_1.png",
                description: "Fast-paced racket sport played in an enclosed glass court."
            }
        ]);
        console.log("   ✅ Sports seeded");

        // Seed Sponsors
        console.log("\n🏆 Seeding sponsors...");
        await Sponsor.bulkCreate([
            {
                name: "Dynamic Sports",
                image: "seeds/sponsor_1.png",
                link: "https://dynamicsports.com"
            },
            {
                name: "Global Padel",
                image: "seeds/sponsor_2.png",
                link: "https://globalpadel.com"
            }
        ]);
        console.log("   ✅ Sponsors seeded");

        // Seed Products
        console.log("\n🛒 Seeding products...");
        await Product.bulkCreate([
            {
                name: "Pro Padel Racket",
                description: "High-performance carbon fiber racket for professional play.",
                price: 1800,
                type: "sale",
                stock: 15,
                image: "seeds/product_1.png"
            },
            {
                name: "Premium Padel Balls",
                description: "Set of 3 high-bounce padel balls.",
                price: 150,
                type: "sale",
                stock: 50,
                image: "seeds/product_2.png"
            }
        ]);
        console.log("   ✅ Products seeded");

        // Seed Coach
        console.log("\n🏅 Seeding coaches...");
        await Coach.create({
            userId: coachUser.id,
            name: "Ahmed Coach",
            bio: "Expert Padel trainer with 10 years of international experience.",
            rating: 4.9,
            image: "seeds/coach_1.png",
            specialties: ["Technical Drills", "Match Strategy"]
        });
        console.log("   ✅ Coaches seeded");

        // ============================================
        // SUMMARY
        // ============================================
        console.log("\n🎉 Seeding completed successfully!");
        console.log("\n📊 Seeding Summary:");
        console.log(`   📍 Branches: ${Object.keys(branchesMap).length}`);
        console.log(`   🏟️  Venues: ${Object.keys(venuesMap).length}`);
        console.log(`   👥 Users: ${Object.keys(usersMap).length}`);
        console.log(`   📅 Bookings: ${bookingsFromCSV.length}`);
        console.log(`   🎾 Sports: 2`);
        console.log(`   🏆 Sponsors: 2`);
        console.log(`   🛒 Products: 2`);
        console.log(`   🏅 Coaches: 1`);

        console.log("\n🔐 Admin credentials:");
        console.log(`   Email: admin@padel.com`);
        console.log(`   Password: password123`);

        process.exit(0);

    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedDatabase();