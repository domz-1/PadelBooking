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
        allowNull: false,
        comment: 'The action performed on the booking (created, updated, cancelled, confirmed, etc.)'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Description of what happened in the booking log'
    },
    previousStatus: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Previous status of the booking before the action'
    },
    newStatus: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'New status of the booking after the action'
    },
    details: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Additional details about the booking action'
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        comment: 'When the booking action occurred'
    }
}, {
    timestamps: false, // We use our own timestamp field
    tableName: 'booking_logs'
});

// Associations
BookingLog.belongsTo(Booking, { foreignKey: 'bookingId' });
BookingLog.belongsTo(User, { foreignKey: 'userId' });
Booking.hasMany(BookingLog, { foreignKey: 'bookingId' });

module.exports = BookingLog;
