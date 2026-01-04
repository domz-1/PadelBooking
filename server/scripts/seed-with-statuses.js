#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { sequelize } = require("../src/config/database");
const bcrypt = require("bcryptjs");
const User = require("../src/modules/users/user.model");
const Branch = require("../src/modules/branches/branch.model");
const Venue = require("../src/modules/venues/venue.model");
const Booking = require("../src/modules/bookings/booking.model");
const BookingStatus = require("../src/modules/settings/bookingStatus.model");
const Coach = require("../src/modules/coaches/coach.model");
const Sport = require("../src/modules/sports/sport.model");
const Sponsor = require("../src/modules/sponsors/sponsor.model");
const Product = require("../src/modules/store/product.model");

const seedDatabaseWithStatuses = async () => {
    try {
        console.log("🌱 Starting seed process with booking statuses...");
        await sequelize.sync({ force: true });
        console.log("📋 Database synced successfully.");

        const passwordHash = await bcrypt.hash("password123", 10);

        // 1. Create Admin
        const admin = await User.create({
            name: "Admin User",
            email: "admin@padel.com",
            password: passwordHash,
            role: "admin",
            phone: "1234567890",
        });
        console.log("👤 Admin created.");

        // 2. Create Default Booking Statuses
        console.log("🎨 Creating default booking statuses...");
        const defaultStatuses = [
            {
                name: "pending",
                color: "#F59E0B",
                description: "Booking is pending confirmation",
                isDefault: true
            },
            {
                name: "confirmed",
                color: "#10B981",
                description: "Booking is confirmed and active",
                isDefault: true
            },
            {
                name: "cancelled",
                color: "#EF4444",
                description: "Booking was cancelled by user or admin",
                isDefault: true
            },
            {
                name: "completed",
                color: "#06B6D4",
                description: "Booking was successfully completed",
                isDefault: true
            },
            {
                name: "no-show",
                color: "#6B7280",
                description: "Customer did not show up for booking",
                isDefault: true
            },
            {
                name: "pending-coach",
                color: "#3B82F6",
                description: "Waiting for coach assignment",
                isDefault: true
            }
        ];

        const statusMap = {}; // For quick lookup
        for (const status of defaultStatuses) {
            const [statusRecord, created] = await BookingStatus.findOrCreate({
                where: { name: status.name },
                defaults: status
            });
            statusMap[status.name] = statusRecord.id;
            console.log(`  ✅ ${status.name} status ${created ? 'created' : 'already exists'}`);
        }

        // 3. Load Seed Data from JSON
        const seedDataPath = path.join(__dirname, "../seeds/seed_data.json");
        if (!fs.existsSync(seedDataPath)) {
            throw new Error(`Seed data file not found at ${seedDataPath}`);
        }
        const seedData = JSON.parse(fs.readFileSync(seedDataPath, "utf8"));

        // 4. Seed Branches
        const branchesMap = {}; // Use normalized names
        for (const bName of seedData.branches) {
            const branch = await Branch.create({
                name: bName,
                location: `${bName} Location`,
                description: `Padel facilities at ${bName}`,
                isActive: true,
            });
            branchesMap[bName.toLowerCase().trim()] = branch.id;
        }
        console.log(`🏢 Created ${Object.keys(branchesMap).length} branches.`);

        // 5. Seed Venues
        const venuesMap = {};
        for (const vData of seedData.venues) {
            const branchId = branchesMap[vData.branch.toLowerCase().trim()];
            const venue = await Venue.create({
                name: vData.name,
                description: `Premium glass court at ${vData.branch}`,
                location: vData.name,
                pricePerHour: 250,
                courts: 1,
                contactEmail: "contact@padel.com",
                contactPhone: "12345678",
                amenities: ["Lighting", "AC", "Parking"],
                branchId: branchId,
                images: ["seeds/sport_1.png"],
            });
            // Store lookup key as "venue_name|branch_name" for absolute uniqueness
            const lookupKey = `${vData.name.toLowerCase().trim()}|${vData.branch.toLowerCase().trim()}`;
            venuesMap[lookupKey] = venue.id;
        }
        console.log(`🏟️ Created ${Object.keys(venuesMap).length} venues.`);

        // 6. Seed Users
        const usersMap = {};
        console.log(`👥 Creating ${seedData.users.length} users...`);

        // Using bulkCreate for speed
        const userRecords = seedData.users.map(u => ({
            name: `${u.firstName} ${u.lastName}`.trim() || "Unknown User",
            email: u.email.toLowerCase().trim(),
            password: passwordHash,
            role: "user",
            phone: u.phone || "00000000",
        }));

        await User.bulkCreate(userRecords, { ignoreDuplicates: true });

        // Refresh map with created users
        const allUsers = await User.findAll({ attributes: ['id', 'email'] });
        allUsers.forEach(u => {
            usersMap[u.email.toLowerCase().trim()] = u.id;
        });

        console.log(`📇 Initialized ${Object.keys(usersMap).length} users in map.`);

        // 7. Seed Bookings from JSON (with status mapping)
        console.log("📅 Starting booking creation from JSON...");
        const bookingRecords = [];
        let skippedCount = 0;

        // Calculate date offset to shift bookings to current time
        let maxDate = new Date(0);
        for (const b of seedData.bookings) {
            const d = new Date(b.start.split(" ")[0]);
            if (d > maxDate) maxDate = d;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // Shift so that the latest booking is 2 days in the future
        const dateOffset = today.getTime() - maxDate.getTime() + (2 * 24 * 60 * 60 * 1000);
        console.log(`🗓️ Shifting bookings by ${Math.floor(dateOffset / (1000 * 60 * 60 * 24))} days to center around today.`);

        for (const bData of seedData.bookings) {
            const userEmail = bData.userEmail.toLowerCase().trim();
            const venueKey = `${bData.venueName.toLowerCase().trim()}|${bData.branchName.toLowerCase().trim()}`;

            const userId = usersMap[userEmail];
            const venueId = venuesMap[venueKey];

            if (!userId || !venueId) {
                skippedCount++;
                continue;
            }

            // Map status from JSON to our status IDs
            let statusName = "confirmed"; // Default
            if (bData.status && bData.status.toLowerCase().includes("cancel")) {
                statusName = "cancelled";
            } else if (bData.status && bData.status.toLowerCase().includes("pending")) {
                statusName = "pending";
            } else if (bData.status && bData.status.toLowerCase().includes("complete")) {
                statusName = "completed";
            }

            // Shift date
            const originalDate = new Date(bData.start.split(" ")[0]);
            const shiftedDate = new Date(originalDate.getTime() + dateOffset);
            const dateStr = shiftedDate.toISOString().split("T")[0];

            bookingRecords.push({
                date: dateStr,
                startTime: bData.start.split(" ")[1],
                endTime: bData.end.split(" ")[1],
                venueId: venueId,
                userId: userId,
                status: statusName,
                statusId: statusMap[statusName],
                totalPrice: parseFloat(bData.price) || 250,
                type: "standard",
            });
        }

        // Process in chunks for safety / memory
        const CHUNK_SIZE = 500;
        for (let i = 0; i < bookingRecords.length; i += CHUNK_SIZE) {
            const chunk = bookingRecords.slice(i, i + CHUNK_SIZE);
            await Booking.bulkCreate(chunk);
            console.log(`📊 Created ${Math.min(i + CHUNK_SIZE, bookingRecords.length)} / ${bookingRecords.length} bookings...`);
        }

        console.log(`📈 Seeding summary from JSON:`);
        console.log(`  - Total Bookings in JSON: ${seedData.bookings.length}`);
        console.log(`  - Successfully seeded: ${bookingRecords.length}`);
        console.log(`  - Skipped: ${skippedCount}`);

        // 8. Seed Bookings from CSV (if file exists)
        const csvBookingsPath = path.join(__dirname, "../seeds/bookings.csv");
        if (fs.existsSync(csvBookingsPath)) {
            console.log("📄 Starting CSV booking import...");
            
            const csvBookings = [];
            let csvProcessed = 0;
            let csvSkipped = 0;
            const pendingUsers = []; // Users to create from CSV

            return new Promise((resolve, reject) => {
                // Read file and remove BOM manually
                const fileContent = fs.readFileSync(csvBookingsPath, 'utf8');
                // Remove BOM (Byte Order Mark) if present
                const contentWithoutBOM = fileContent.charCodeAt(0) === 0xFEFF ? fileContent.slice(1) : fileContent;
                
                // Create a readable stream from the string
                const { Readable } = require('stream');
                const stringStream = new Readable();
                stringStream.push(contentWithoutBOM);
                stringStream.push(null); // End the stream
                
                stringStream
                    .pipe(csv({ separator: ',', skipLines: 0 }))
                    .on('headers', (headers) => {
                        console.log(`📋 CSV Headers: ${headers.join(', ')}`);
                    })
                    .on('data', (row) => {
                        csvProcessed++;
                        
                        // Debug: Log first few rows
                        if (csvProcessed <= 3) {
                            console.log(`🔍 Sample row ${csvProcessed}:`, {
                                start: row['Scheduled start'],
                                end: row['End'],
                                email: row['Holder email'],
                                court: row['Spaces']
                            });
                        }
                        
                        try {
                            // Parse CSV data
                            const startDateTime = row['Scheduled start'] || '';
                            const endDateTime = row['End'] || '';
                            const paymentStatus = row['Payment status'] || 'Paid';
                            const holderEmail = row['Holder email'] || '';
                            const courtInfo = row['Spaces'] || '';
                            
                            if (!startDateTime || !endDateTime || !holderEmail || !courtInfo) {
                                if (csvProcessed <= 5) {
                                    console.log(`⚠️  Skipping row ${csvProcessed} - missing required data`);
                                }
                                csvSkipped++;
                                return;
                            }

                            // Extract venue and branch from court info
                            let venueName = courtInfo;
                            let branchName = 'Unknown';

                            // Handle different court formats
                            if (courtInfo.includes('🔴')) {
                                const courtMatch = courtInfo.match(/🔴\s*(.*?)\s*\((.*?)\)/);
                                venueName = courtMatch ? courtMatch[1].trim() : courtInfo;
                                branchName = courtMatch ? courtMatch[2].trim() : 'Unknown';
                            } else if (courtInfo.includes('⚪')) {
                                const courtMatch = courtInfo.match(/⚪\s*(.*?)\s*\((.*?)\)/);
                                venueName = courtMatch ? courtMatch[1].trim() : courtInfo;
                                branchName = courtMatch ? courtMatch[2].trim() : 'Unknown';
                            } else if (courtInfo.includes('Padbol')) {
                                venueName = 'Padbol Court';
                                branchName = courtInfo.split('⚽')[1]?.split('⚽')[0]?.trim() || 'Unknown';
                            }

                            // Normalize venue names to match our seed data
                            venueName = normalizeVenueName(venueName);
                            branchName = normalizeBranchName(branchName);

                            // Find or create user
                            const userEmail = holderEmail.toLowerCase().trim();
                            let userId = usersMap[userEmail];
                            
                            if (!userId) {
                                // Create user if doesn't exist
                                const firstName = row['Holder first name'] || 'CSV';
                                const lastName = row['Holder last name'] || 'User';
                                const phone = row['Holder telephone'] || '00000000';
                                
                                // Add to pending users list for bulk creation
                                pendingUsers.push({
                                    email: userEmail,
                                    name: `${firstName} ${lastName}`.trim(),
                                    password: passwordHash,
                                    role: "user",
                                    phone: phone.replace(/[^0-9]/g, ''),
                                });
                                
                                csvSkipped++;
                                return;
                            }

                            // Find venue
                            const venueKey = `${venueName.toLowerCase().trim()}|${branchName.toLowerCase().trim()}`;
                            const venueId = venuesMap[venueKey];
                            
                            if (!venueId) {
                                if (csvProcessed <= 5) {
                                    console.log(`⚠️  Skipping row ${csvProcessed} - venue not found: ${venueName} at ${branchName}`);
                                }
                                csvSkipped++;
                                return;
                            }

                            // Map payment status to booking status
                            let statusName = 'confirmed';
                            if (paymentStatus.toLowerCase().includes('unpaid')) {
                                statusName = 'pending';
                            } else if (paymentStatus.toLowerCase().includes('cancel')) {
                                statusName = 'cancelled';
                            }

                            // Parse dates (shift to current timeframe)
                            const startParts = startDateTime.split(' ');
                            const endParts = endDateTime.split(' ');
                            
                            if (startParts.length < 2 || endParts.length < 2) {
                                csvSkipped++;
                                return;
                            }

                            const originalStartDate = new Date(startParts[0]);
                            const shiftedStartDate = new Date(originalStartDate.getTime() + dateOffset);
                            const dateStr = shiftedStartDate.toISOString().split('T')[0];

                            // Calculate price based on duration
                            const startTime = startParts[1];
                            const endTime = endParts[1];
                            const price = calculatePriceFromDuration(startTime, endTime);

                            csvBookings.push({
                                date: dateStr,
                                startTime: startTime,
                                endTime: endTime,
                                venueId: venueId,
                                userId: userId,
                                status: statusName,
                                statusId: statusMap[statusName],
                                totalPrice: price,
                                type: courtInfo.includes('Padbol') ? 'padbol' : 'standard',
                            });
                            
                        } catch (error) {
                            csvSkipped++;
                            console.log(`⚠️  Error processing CSV row ${csvProcessed}:`, error.message);
                        }
                    })
                    .on('end', async () => {
                        console.log(`📊 CSV Processing complete: ${csvProcessed} rows processed`);
                        
                        // Create pending users first
                        if (pendingUsers.length > 0) {
                            console.log(`👥 Creating ${pendingUsers.length} new users from CSV...`);
                            const createdUsers = await User.bulkCreate(pendingUsers, { ignoreDuplicates: true });
                            
                            // Update users map with newly created users
                            const newUsers = await User.findAll({
                                where: { email: pendingUsers.map(u => u.email) },
                                attributes: ['id', 'email']
                            });
                            
                            newUsers.forEach(u => {
                                usersMap[u.email.toLowerCase().trim()] = u.id;
                            });
                            
                            console.log(`✅ Created ${newUsers.length} new users`);
                        }
                        
                        // Now process CSV bookings in chunks
                        const CSV_CHUNK_SIZE = 500;
                        for (let i = 0; i < csvBookings.length; i += CSV_CHUNK_SIZE) {
                            const chunk = csvBookings.slice(i, i + CSV_CHUNK_SIZE);
                            await Booking.bulkCreate(chunk);
                            console.log(`💾 Created ${Math.min(i + CSV_CHUNK_SIZE, csvBookings.length)} / ${csvBookings.length} CSV bookings...`);
                        }

                        console.log(`📈 CSV Seeding summary:`);
                        console.log(`  - Total CSV rows processed: ${csvProcessed}`);
                        console.log(`  - Successfully seeded: ${csvBookings.length}`);
                        console.log(`  - Skipped: ${csvSkipped}`);
                        console.log(`  - New users created: ${pendingUsers.length}`);
                        
                        resolve();
                    })
                    .on('error', (error) => {
                        console.error('❌ CSV processing error:', error);
                        reject(error);
                    });
            });
        } else {
            console.log("ℹ️  No CSV bookings file found, skipping CSV import.");
        }

        // 9. Seed Sports
        await Sport.create({
            name: "Padel",
            icon: "seeds/sport_1.png",
            description: "Fast-paced racket sport played in an enclosed glass court.",
        });
        await Sport.create({
            name: "Padbol",
            icon: "seeds/sport_1.png",
            description: "A fusion of football, squash, and volleyball.",
        });
        console.log("🎾 Sports seeded.");

        // 10. Seed Sponsors
        await Sponsor.create({
            name: "Dynamic Sports",
            image: "seeds/sponsor_1.png",
            link: "https://dynamicsports.com",
        });
        await Sponsor.create({
            name: "Global Padel",
            image: "seeds/sponsor_2.png",
            link: "https://globalpadel.com",
        });
        console.log("🏆 Sponsors seeded.");

        // 11. Seed Store Products
        await Product.create({
            name: "Pro Padel Racket",
            description: "High-performance carbon fiber racket for professional play.",
            price: 1800,
            type: "sale",
            stock: 15,
            image: "seeds/product_1.png",
        });
        await Product.create({
            name: "Premium Padel Balls",
            description: "Set of 3 high-bounce padel balls.",
            price: 150,
            type: "sale",
            stock: 50,
            image: "seeds/product_2.png",
        });
        console.log("🛒 Products seeded.");

        // 12. Seed Coaches
        const coachUser = await User.create({
            name: "Coach Ahmed",
            email: "coach.ahmed@padel.com",
            password: passwordHash,
            role: "coach",
            phone: "01012345678",
        });
        await Coach.create({
            userId: coachUser.id,
            name: "Ahmed Coach",
            bio: "Expert Padel trainer with 10 years of international experience.",
            rating: 4.9,
            image: "seeds/coach_1.png",
            specialties: ["Technical Drills", "Match Strategy"],
        });
        console.log("👨‍🏫 Coaches seeded.");

        console.log("🎉 Seeding completed successfully!");
        console.log("\n📊 Final Summary:");
        console.log(`  - Booking Statuses: ${Object.keys(statusMap).length} created`);
        console.log(`  - Branches: ${Object.keys(branchesMap).length} created`);
        console.log(`  - Venues: ${Object.keys(venuesMap).length} created`);
        console.log(`  - Users: ${Object.keys(usersMap).length} created`);
        console.log(`  - Bookings: ${bookingRecords.length} from JSON + ${csvBookings?.length || 0} from CSV`);
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

// Helper function to normalize venue names
function normalizeVenueName(venueName) {
    const normalized = venueName.toLowerCase().trim();
    
    // Map CSV venue names to our seed data names
    if (normalized.includes('court 1') || normalized.includes('court one')) return 'Court 1';
    if (normalized.includes('court 2') || normalized.includes('court two')) return 'Court 2';
    if (normalized.includes('court 3') || normalized.includes('court three')) return 'Court 3';
    if (normalized.includes('center court') || normalized.includes('main court')) return 'Center Court';
    if (normalized.includes('padbol') || normalized.includes('football')) return 'Padbol Court';
    
    return venueName; // Fallback to original
}

// Helper function to normalize branch names
function normalizeBranchName(branchName) {
    const normalized = branchName.toLowerCase().trim();
    
    // Map CSV branch names to our seed data names
    if (normalized.includes('ring road') || normalized.includes('ring')) return 'Ring Road';
    if (normalized.includes('el giesh') || normalized.includes('giesh') || normalized.includes('elgiesh')) return 'El Giesh St';
    if (normalized.includes('new cairo') || normalized.includes('cairo')) return 'New Cairo';
    if (normalized.includes('zamalek') || normalized.includes('zamalek')) return 'Zamalek';
    
    return branchName; // Fallback to original
}

// Helper function to calculate price based on time duration
function calculatePriceFromDuration(startTime, endTime) {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startTotal = startHour * 60 + startMin;
    const endTotal = endHour * 60 + endMin;
    const durationMinutes = endTotal - startTotal;
    const durationHours = durationMinutes / 60;
    
    // Base price: 250 EGP per hour
    return Math.round(durationHours * 250);
}

seedDatabaseWithStatuses();