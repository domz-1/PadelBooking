const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../config/database');

const BookingStatus = sequelize.define('BookingStatus', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    color: {
        type: DataTypes.STRING, // Hex code
        defaultValue: '#000000'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    isDefault: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true
});

module.exports = BookingStatus;