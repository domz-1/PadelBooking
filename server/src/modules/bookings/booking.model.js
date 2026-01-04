const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const User = require('../users/user.model');
const Venue = require('../venues/venue.model');

const Booking = sequelize.define('Booking', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    startTime: {
        type: DataTypes.TIME,
        allowNull: false
    },
    endTime: {
        type: DataTypes.TIME,
        allowNull: false
    },
    matchResult: {
        type: DataTypes.JSONB, // { winner: [], loser: [], score: '' }
        allowNull: true
    },

    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    totalPrice: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('standard', 'academy'),
        defaultValue: 'standard'
    },
    participants: {
        type: DataTypes.ARRAY(DataTypes.INTEGER), // Array of User IDs
        defaultValue: []
    },

    statusId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'BookingStatuses',
            key: 'id'
        }
    },
    hasOffer: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    offerValue: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    isOpenMatch: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    openMatchPlayers: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        defaultValue: []
    },
    openMatchMaxPlayers: {
        type: DataTypes.INTEGER,
        defaultValue: 4
    }
}, {
    timestamps: true
});

// Associations
Booking.belongsTo(User, { foreignKey: 'userId' });
Booking.belongsTo(Venue, { foreignKey: 'venueId' });
const BookingStatus = require('../settings/bookingStatus.model');
Booking.belongsTo(BookingStatus, { foreignKey: 'statusId' });
const Coach = require('../coaches/coach.model');
const Package = require('../coaches/package.model');
Booking.belongsTo(Coach, { foreignKey: 'coachId' });
Booking.belongsTo(Package, { foreignKey: 'packageId' });
User.hasMany(Booking, { foreignKey: 'userId' });
Venue.hasMany(Booking, { foreignKey: 'venueId' });

module.exports = Booking;
