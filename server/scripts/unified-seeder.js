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
const Category = require("../src/modules/store/category.model");
const GlobalConfig = require("../src/modules/settings/globalConfig.model");
const Package = require("../src/modules/coaches/package.model");

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

        // 0. SEED GLOBAL CONFIG
        console.log("\n⚙️ Seeding global config...");
        await GlobalConfig.upsert({
            id: 1, // Ensure single record
            businessName: "PadelH",
            supportNumber1: "0100 123 4567",
            supportNumber2: "0111 987 6543",
            storeName: "PadelH Store",
            storePhone: "0155 555 5555",
            themeColor: "#10B981", // emerald-500
            secondaryColor: "#064E3B", // emerald-900
            accentColor: "#059669", // emerald-600
            logo: "placeholder/logo.png",
            storeLogo: "placeholder/store-logo.jpg"
        });
        console.log("   ✅ Global config seeded");

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

        // Create coach users
        const coachesData = [
            { name: "Ahmed Hassan", email: "ahmed.hassan@padel.com", phone: "01012345671" },
            { name: "Sofia Rodriguez", email: "sofia.rodriguez@padel.com", phone: "01012345672" },
            { name: "Carlos Mendez", email: "carlos.mendez@padel.com", phone: "01012345673" },
            { name: "Mariam Ali", email: "mariam.ali@padel.com", phone: "01012345674" }
        ];

        const coachIds = [];
        for (const coach of coachesData) {
            const user = await User.create({
                name: coach.name,
                email: coach.email,
                password: passwordHash,
                role: "coach",
                phone: coach.phone,
                image: "placeholder/padel-coach-2.png"
            }, { hooks: false });
            usersMap[coach.email] = user.id;
            coachIds.push({ id: user.id, name: coach.name });
            console.log(`   ✅ Created coach user: ${user.email}`);
        }

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

        // Seed Categories
        console.log("\n📁 Seeding categories...");
        const categories = await Category.bulkCreate([
            { name: "Rackets", description: "Professional and beginner padel rackets" },
            { name: "Accessories", description: "Balls, bags, and other padel gear" },
            { name: "Apparel", description: "Shoes, wristbands, and sport clothing" }
        ]);
        const racketCatId = categories[0].id;
        const accCatId = categories[1].id;
        const apparelCatId = categories[2].id;
        console.log("   ✅ Categories seeded");

        // Seed Products
        console.log("\n🛒 Seeding products...");
        const placeholderImg = "placeholder/product-padel.png";
        await Product.bulkCreate([
            {
                name: "Pro Carbon Padel Racket",
                description: "High-performance carbon fiber racket for professional play. Optimized for power and control.",
                price: 1800,
                isPriceless: false,
                showInLanding: true,
                type: "sale",
                stock: 15,
                image: placeholderImg,
                categoryId: racketCatId
            },
            {
                name: "Beginner Friendly Racket",
                description: "Perfect for those starting their padel journey. Lightweight and easy to handle.",
                price: 850,
                isPriceless: false,
                showInLanding: true,
                type: "sale",
                stock: 25,
                image: placeholderImg,
                categoryId: racketCatId
            },
            {
                name: "Premium Padel Balls (3-Pack)",
                description: "High-quality yellow padel balls designed for consistent bounce and durability.",
                price: 150,
                isPriceless: false,
                showInLanding: true,
                type: "sale",
                stock: 100,
                image: placeholderImg,
                categoryId: accCatId
            },
            {
                name: "Professional Padel Bag",
                description: "Spacious bag with thermal compartments to protect your rackets and gear.",
                price: null,
                isPriceless: true,
                showInLanding: true,
                type: "sale",
                stock: 10,
                image: placeholderImg,
                categoryId: accCatId
            },
            {
                name: "Elite Padel Shoes",
                description: "Designed specifically for padel courts, offering maximum grip and comfort.",
                price: 1200,
                isPriceless: false,
                showInLanding: false,
                type: "sale",
                stock: 20,
                image: placeholderImg,
                categoryId: apparelCatId
            },
            {
                name: "Padel Wristband Set",
                description: "Absorbent and comfortable wristbands to keep you dry during intense matches.",
                price: null,
                isPriceless: true,
                showInLanding: true,
                type: "sale",
                stock: 50,
                image: placeholderImg,
                categoryId: apparelCatId
            },
            {
                name: "Carbon Fiber Grip",
                description: "Anti-slip grip for better racket control and sweat absorption.",
                price: 45,
                isPriceless: false,
                showInLanding: true,
                type: "sale",
                stock: 150,
                image: placeholderImg,
                categoryId: accCatId
            },
            {
                name: "Summer Sport Shorts",
                description: "Breathable and flexible shorts for maximum movement on court.",
                price: 350,
                isPriceless: false,
                showInLanding: false,
                type: "sale",
                stock: 40,
                image: placeholderImg,
                categoryId: apparelCatId
            }
        ]);
        console.log("   ✅ Products seeded");

        // Seed Coaches
        console.log("\n🏅 Seeding coaches...");
        const coachProfiles = [
            { bio: "Expert Padel trainer with 10 years of international experience.", rating: 4.9, specialties: ["Technical Drills", "Match Strategy"] },
            { bio: "Professional instructor focused on player performance and conditioning.", rating: 4.8, specialties: ["Performance", "Conditioning"] },
            { bio: "Specialized in advanced tactics and professional tournament preparation.", rating: 4.9, specialties: ["Tactics", "Tournaments"] },
            { bio: "Building strong foundations for future padel champions.", rating: 4.7, specialties: ["Foundations", "Youth"] }
        ];

        for (let i = 0; i < coachIds.length; i++) {
            const coach = await Coach.create({
                userId: coachIds[i].id,
                name: coachIds[i].name,
                bio: coachProfiles[i].bio,
                rating: coachProfiles[i].rating,
                image: "placeholder/padel-coach-2.png",
                specialties: coachProfiles[i].specialties
            });

            // Seed Packages for each coach
            await Package.bulkCreate([
                {
                    coachId: coach.id,
                    name: "Single Session",
                    description: "60-minute intensive private training session.",
                    price: 450,
                    sessions: 1
                },
                {
                    coachId: coach.id,
                    name: "Foundations Pack",
                    description: "5 sessions focused on technical basics and positioning.",
                    price: 2000,
                    sessions: 5
                },
                {
                    coachId: coach.id,
                    name: "Performance Pack",
                    description: "10 sessions for advanced players looking to master match strategy.",
                    price: 3800,
                    sessions: 10
                }
            ]);
            console.log(`   ✅ Seeded coach ${coach.name} with 3 packages`);
        }

        // ============================================
        // SUMMARY
        // ============================================
        console.log("\n🎉 Seeding completed successfully!");
        console.log("\n📊 Seeding Summary:");
        console.log(`   📍 Branches: ${Object.keys(branchesMap).length}`);
        console.log(`   🏟️  Venues: ${Object.keys(venuesMap).length}`);
        console.log(`   👥 Users: ${Object.keys(usersMap).length}`);
        console.log(`   📅 Bookings: ${bookingsFromCSV.length}`);
        console.log(`   🎾 Sports: 1`);
        console.log(`   🏆 Sponsors: 2`);
        console.log(`   🛒 Products: 6`);
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