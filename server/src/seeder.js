const { sequelize } = require('./config/database');
const User = require('./modules/users/user.model');
const Venue = require('./modules/venues/venue.model');
const Product = require('./modules/store/product.model');
const Branch = require('./modules/branches/branch.model');
const GlobalConfig = require('./modules/settings/globalConfig.model');
const bcrypt = require('bcryptjs');

const seed = async () => {
    try {
        await sequelize.sync({ force: true }); // Clear DB
        console.log('Database cleared.');

        // 1. Create Global Config
        await GlobalConfig.create({
            businessName: 'Padel Pro',
            currency: 'USD',
            themeColor: '#4CAF50',
            region: 'EG',
            city: 'Cairo'
        });
        console.log('Global Config created.');

        // 2. Create Users
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const admin = await User.create({
            name: 'Super Admin',
            email: 'admin@padel.com',
            password: 'password123', // Will be hashed by hook
            role: 'admin',
            isPublic: true
        });

        const user1 = await User.create({
            name: 'John Doe',
            email: 'john@example.com',
            password: hashedPassword,
            role: 'user',
            isPublic: true,
            stats: { played: 10, won: 6, lost: 4 }
        });

        const user2 = await User.create({
            name: 'Jane Smith',
            email: 'jane@example.com',
            password: hashedPassword,
            role: 'user',
            isPublic: false
        });
        console.log('Users created.');

        // 3. Create Branches
        const branch1 = await Branch.create({
            name: 'Downtown Branch',
            location: 'Downtown Cairo',
            description: 'Main branch in the heart of the city',
            phoneNumber: '+201234567890',
            email: 'downtown@padel.com'
        });

        const branch2 = await Branch.create({
            name: 'Beachside Branch',
            location: 'North Coast',
            description: 'Summer vibes only',
            phoneNumber: '+201098765432',
            email: 'beach@padel.com'
        });
        console.log('Branches created.');

        // 4. Create Venues
        const venue1 = await Venue.create({
            name: 'Central Court',
            location: 'Downtown',
            type: 'indoor',
            pricePerHour: 100,
            facilities: ['Showers', 'Parking'],
            branchId: branch1.id
        });

        const venue2 = await Venue.create({
            name: 'Sunny Side',
            location: 'Beachside',
            type: 'outdoor',
            pricePerHour: 120,
            facilities: ['Cafe', 'Shop'],
            branchId: branch2.id
        });
        console.log('Venues created.');

        // 4. Create Products
        await Product.create({
            name: 'Pro Racket X1',
            description: 'High end racket',
            price: 250.00,
            type: 'sale',
            stock: 10
        });

        await Product.create({
            name: 'Rental Ball Pack',
            description: 'Pack of 3 balls',
            price: 5.00,
            type: 'rental',
            stock: 50
        });
        console.log('Products created.');

        console.log('Seeding complete!');
        console.log('-----------------------------------');
        console.log('Admin Credentials:');
        console.log('Email: admin@padel.com');
        console.log('Password: password123');
        console.log('-----------------------------------');
        process.exit();
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seed();
