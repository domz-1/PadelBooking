const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const GlobalConfig = sequelize.define('GlobalConfig', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    businessName: {
        type: DataTypes.STRING,
        defaultValue: 'PadelBooking'
    },
    logo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    themeColor: {
        type: DataTypes.STRING,
        defaultValue: '#4CAF50' // Default Green
    },
    region: {
        type: DataTypes.STRING,
        defaultValue: 'EG'
    },
    city: {
        type: DataTypes.STRING,
        defaultValue: 'Cairo'
    },
    timezone: {
        type: DataTypes.STRING,
        defaultValue: 'UTC'
    },
    minBookingDuration: {
        type: DataTypes.INTEGER, // in minutes
        defaultValue: 60
    },
    currency: {
        type: DataTypes.STRING,
        defaultValue: 'USD'
    }
}, {
    timestamps: true
});

module.exports = GlobalConfig;
