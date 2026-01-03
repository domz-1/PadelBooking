const fs = require("fs");
const path = require("path");
const { sequelize } = require("./config/database");
const bcrypt = require("bcryptjs");
const User = require("./modules/users/user.model");
const Branch = require("./modules/branches/branch.model");
const Venue = require("./modules/venues/venue.model");
const Booking = require("./modules/bookings/booking.model");
const Coach = require("./modules/coaches/coach.model");
const Sport = require("./modules/sports/sport.model");
const Sponsor = require("./modules/sponsors/sponsor.model");
const Product = require("./modules/store/product.model");

const seedDatabase = async () => {
    try {
        console.log("Starting seed process...");
        await sequelize.sync({ force: true });
        console.log("Database synced successfully.");

        const passwordHash = await bcrypt.hash("password123", 10);

        // 1. Create Admin
        const admin = await User.create({
            name: "Admin User",
            email: "admin@padel.com",
            password: passwordHash,
            role: "admin",
            phone: "1234567890",
        });
        console.log("Admin created.");

        // 2. Load Seed Data from JSON
        const seedDataPath = path.join(__dirname, "../seeds/seed_data.json");
        if (!fs.existsSync(seedDataPath)) {
            throw new Error(`Seed data file not found at ${seedDataPath}`);
        }
        const seedData = JSON.parse(fs.readFileSync(seedDataPath, "utf8"));

        // 3. Seed Branches
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
        console.log(`Created ${Object.keys(branchesMap).length} branches.`);

        // 4. Seed Venues
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
        console.log(`Created ${Object.keys(venuesMap).length} venues.`);

        // 5. Seed Users
        const usersMap = {};
        console.log(`Creating ${seedData.users.length} users...`);

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

        console.log(`Initialized ${Object.keys(usersMap).length} users in map.`);

        // 6. Seed Bookings
        console.log("Starting booking creation...");
        const bookingRecords = [];
        let skippedCount = 0;

        // Calculate date offset to shift bookings to current time
        // Find the latest date in seed data
        let maxDate = new Date(0);
        for (const b of seedData.bookings) {
            const d = new Date(b.start.split(" ")[0]);
            if (d > maxDate) maxDate = d;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // Shift so that the latest booking is 2 days in the future
        const dateOffset = today.getTime() - maxDate.getTime() + (2 * 24 * 60 * 60 * 1000);
        console.log(`Shifting bookings by ${Math.floor(dateOffset / (1000 * 60 * 60 * 24))} days to center around today.`);

        for (const bData of seedData.bookings) {
            const userEmail = bData.userEmail.toLowerCase().trim();
            const venueKey = `${bData.venueName.toLowerCase().trim()}|${bData.branchName.toLowerCase().trim()}`;

            const userId = usersMap[userEmail];
            const venueId = venuesMap[venueKey];

            if (!userId || !venueId) {
                skippedCount++;
                continue;
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
                status: bData.status,
                totalPrice: parseFloat(bData.price) || 250,
                type: "standard",
            });
        }

        // Process in chunks for safety / memory
        const CHUNK_SIZE = 500;
        for (let i = 0; i < bookingRecords.length; i += CHUNK_SIZE) {
            const chunk = bookingRecords.slice(i, i + CHUNK_SIZE);
            await Booking.bulkCreate(chunk);
            console.log(`Created ${Math.min(i + CHUNK_SIZE, bookingRecords.length)} / ${bookingRecords.length} bookings...`);
        }

        console.log(`Seeding summary:`);
        console.log(`- Total Bookings in JSON: ${seedData.bookings.length}`);
        console.log(`- Successfully seeded: ${bookingRecords.length}`);
        console.log(`- Skipped: ${skippedCount}`);

        // 7. Seed Sports
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
        console.log("Sports seeded.");

        // 8. Seed Sponsors
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
        console.log("Sponsors seeded.");

        // 9. Seed Store Products
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
        console.log("Products seeded.");

        // 10. Seed Coaches
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
        console.log("Coaches seeded.");

        console.log("Seeding completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
};

seedDatabase();
