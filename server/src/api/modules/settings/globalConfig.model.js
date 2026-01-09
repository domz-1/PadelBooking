const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../config/database');

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
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('logo');
            const baseUrl = process.env.BASE_URL || 'http://localhost:4000';
            if (!rawValue) return `${baseUrl}/placeholder/logo.png`;
            if (rawValue.startsWith('http')) return rawValue;
            return `${baseUrl}/${rawValue.replace(/\\/g, '/')}`;
        }
    },
    themeColor: {
        type: DataTypes.STRING,
        defaultValue: '#4CAF50' // Default Green
    },
    secondaryColor: {
        type: DataTypes.STRING,
        defaultValue: '#2E7D32'
    },
    accentColor: {
        type: DataTypes.STRING,
        defaultValue: '#81C784'
    },
    primaryForeground: {
        type: DataTypes.STRING,
        defaultValue: '#FFFFFF'
    },
    sidebarColor: {
        type: DataTypes.STRING,
        defaultValue: '#FFFFFF'
    },
    favicon: {
        type: DataTypes.STRING,
        allowNull: true
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
    },
    supportNumber1: {
        type: DataTypes.STRING,
        allowNull: true
    },
    supportNumber2: {
        type: DataTypes.STRING,
        allowNull: true
    },
    storeName: {
        type: DataTypes.STRING,
        defaultValue: 'Padel Pro Store'
    },
    storeLogo: {
        type: DataTypes.STRING,
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('storeLogo');
            const baseUrl = process.env.BASE_URL || 'http://localhost:4000';
            if (!rawValue) return `${baseUrl}/placeholder/store-logo.jpg`;
            if (rawValue.startsWith('http')) return rawValue;
            return `${baseUrl}/${rawValue.replace(/\\/g, '/')}`;
        }
    },
    storePhone: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = GlobalConfig;
