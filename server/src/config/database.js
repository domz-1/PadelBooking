const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false, // Set to console.log to see SQL queries
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ PostgreSQL Connected');
        
        // Check if we're in development mode
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        if (isDevelopment) {
            // In development, use a safer sync approach
            // First sync without alterations to ensure all tables exist
            await sequelize.sync();
            console.log('✅ Database tables ensured');
            
            // Then try to apply alterations if needed
            // This two-step approach helps avoid foreign key constraint issues
            try {
                await sequelize.sync({ alter: true });
                console.log('✅ Database alterations applied');
            } catch (alterError) {
                console.warn('⚠️  Some database alterations failed (this may be normal):', alterError.message);
                // Continue even if alterations fail - the database is still usable
            }
        } else {
            // In production, just sync without alterations
            await sequelize.sync();
            console.log('✅ Database Synced');
        }
        
    } catch (error) {
        console.error('❌ Database Connection Error:', error);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
