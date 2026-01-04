const { sequelize } = require('../src/config/database');
const User = require('../src/modules/users/user.model');

const seedAdmin = async () => {
    try {
        console.log('🔑 Seeding admin user...');
        await sequelize.authenticate();
        
        // Check if admin already exists
        const existingAdmin = await User.findOne({ where: { email: 'admin@padel.com' } });
        
        if (existingAdmin) {
            console.log('✅ Admin user already exists');
            console.log('📋 Admin details:', {
                id: existingAdmin.id,
                name: existingAdmin.name,
                email: existingAdmin.email,
                role: existingAdmin.role
            });
            return;
        }
        
        // Create new admin user
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@padel.com',
            password: 'password123', // This will be hashed by the model hooks
            role: 'admin',
            phone: '1234567890'
        });
        
        console.log('✅ Admin user created successfully!');
        console.log('📋 Admin details:', {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role
        });
        console.log('🔐 Default password: password123');
        
    } catch (error) {
        console.error('❌ Error seeding admin:', error.message);
        process.exit(1);
    }
};

seedAdmin();