const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const Booking = require('./booking.model');
const User = require('../users/user.model');

const BookingLog = sequelize.define('BookingLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    bookingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Booking,
            key: 'id'
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Can be null if system action, but usually user triggered
        references: {
            model: User,
            key: 'id'
        }
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false
    },
    details: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: false // We use our own timestamp field
});

// Associations
BookingLog.belongsTo(Booking, { foreignKey: 'bookingId' });
BookingLog.belongsTo(User, { foreignKey: 'userId' });
Booking.hasMany(BookingLog, { foreignKey: 'bookingId' });

module.exports = BookingLog;
