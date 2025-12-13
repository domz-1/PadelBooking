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
        // Sync models (in development, alter: true is okay, but be careful in production)
        await sequelize.sync({ alter: true });
        console.log('✅ Database Synced');
    } catch (error) {
        console.error('❌ Database Connection Error:', error);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
