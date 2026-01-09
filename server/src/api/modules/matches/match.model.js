const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../config/database');
const User = require('../users/user.model');
const Venue = require('../venues/venue.model');

const Match = sequelize.define('Match', {
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
    level: {
        type: DataTypes.STRING, // e.g., Beginner, Intermediate, Advanced
        allowNull: true
    },
    type: {
        type: DataTypes.ENUM('friendly', 'competitive'),
        defaultValue: 'friendly'
    },
    status: {
        type: DataTypes.ENUM('open', 'full', 'cancelled', 'completed'),
        defaultValue: 'open'
    },
    maxPlayers: {
        type: DataTypes.INTEGER,
        defaultValue: 4
    }
}, {
    timestamps: true
});

Match.belongsTo(User, { as: 'Creator', foreignKey: 'creatorId' });
Match.belongsTo(Venue, { foreignKey: 'venueId' });

// Join Requests (Many-to-Many or separate model? Let's use a separate model for requests)
const MatchRequest = sequelize.define('MatchRequest', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'declined'),
        defaultValue: 'pending'
    }
}, { timestamps: true });

MatchRequest.belongsTo(User, { foreignKey: 'userId' });
MatchRequest.belongsTo(Match, { foreignKey: 'matchId' });
Match.hasMany(MatchRequest, { foreignKey: 'matchId' });
User.hasMany(MatchRequest, { foreignKey: 'userId' });

module.exports = { Match, MatchRequest };
