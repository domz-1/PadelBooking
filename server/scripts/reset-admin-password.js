const { sequelize } = require('../src/config/database');
const User = require('../src/modules/users/user.model');
const bcrypt = require('bcryptjs');

const resetAdminPassword = async () => {
    try {
        console.log('🔑 Resetting admin password...');
        await sequelize.authenticate();
        
        // Find admin user
        const admin = await User.findOne({ where: { email: 'admin@padel.com' } });
        
        if (!admin) {
            console.error('❌ Admin user not found');
            process.exit(1);
        }
        
        console.log('📋 Found admin user:', {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role
        });
        
        // Update password using plain text so the model hooks can hash it properly
        admin.password = 'password123';
        await admin.save();
        
        console.log('✅ Admin password reset successfully!');
        console.log('🔐 New password: password123');
        
        // Verify the password works
        const updatedAdmin = await User.findOne({ where: { email: 'admin@padel.com' } });
        const isMatch = await bcrypt.compare('password123', updatedAdmin.password);
        console.log('🔍 Password verification:', isMatch ? '✅ Password works correctly' : '❌ Password verification failed');
        
    } catch (error) {
        console.error('❌ Error resetting admin password:', error.message);
        process.exit(1);
    }
};

resetAdminPassword();