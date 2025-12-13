const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const User = require('../users/user.model');
const Venue = require('../venues/venue.model');

const Waitlist = sequelize.define('Waitlist', {
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
    notified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true
});

Waitlist.belongsTo(User, { foreignKey: 'userId' });
Waitlist.belongsTo(Venue, { foreignKey: 'venueId' });
User.hasMany(Waitlist, { foreignKey: 'userId' });
Venue.hasMany(Waitlist, { foreignKey: 'venueId' });

module.exports = Waitlist;
