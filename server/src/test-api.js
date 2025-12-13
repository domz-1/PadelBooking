const axios = require('axios');

const API_URL = 'http://localhost:5000/api/v1';
let adminToken = '';
let userToken = '';
let venueId = '';
let productId = '';

const runTests = async () => {
    try {
        console.log('--- Starting Automated Tests ---');

        // 1. Login Admin
        console.log('1. Logging in Admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@example.com',
            password: 'password123'
        });
        adminToken = loginRes.data.token;
        console.log('   Success! Token received.');

        // 2. Login User
        console.log('2. Logging in User...');
        const userLoginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'john@example.com',
            password: 'password123'
        });
        userToken = userLoginRes.data.token;
        console.log('   Success! Token received.');

        // 3. Get Venues
        console.log('3. Fetching Venues...');
        const venuesRes = await axios.get(`${API_URL}/venues`);
        if (venuesRes.data.data.length > 0) {
            venueId = venuesRes.data.data[0].id;
            console.log(`   Success! Found ${venuesRes.data.data.length} venues. Using Venue ID: ${venueId}`);
        } else {
            throw new Error('No venues found');
        }

        // 4. Create Booking (User)
        console.log('4. Creating Booking...');
        const bookingRes = await axios.post(`${API_URL}/bookings`, {
            venueId: venueId,
            date: '2025-12-25',
            startTime: '10:00',
            endTime: '11:00'
        }, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        console.log('   Success! Booking ID:', bookingRes.data.data.id);

        // 5. Get Products
        console.log('5. Fetching Products...');
        const productsRes = await axios.get(`${API_URL}/store/products`);
        if (productsRes.data.data.length > 0) {
            productId = productsRes.data.data[0].id;
            console.log(`   Success! Found ${productsRes.data.data.length} products. Using Product ID: ${productId}`);
        } else {
            throw new Error('No products found');
        }

        // 6. Create Order (User)
        console.log('6. Creating Order...');
        const orderRes = await axios.post(`${API_URL}/store/orders`, {
            items: [{ productId: productId, quantity: 1 }],
            paymentMethod: 'cash'
        }, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        console.log('   Success! Order ID:', orderRes.data.data.id);

        // 7. Check Profile Stats
        console.log('7. Checking Profile...');
        const profileRes = await axios.get(`${API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        console.log('   Success! User:', profileRes.data.data.name);

        console.log('--- All Tests Passed Successfully! ---');

    } catch (error) {
        console.error('Test Failed:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
};

// Wait for server to start
setTimeout(runTests, 3000);
