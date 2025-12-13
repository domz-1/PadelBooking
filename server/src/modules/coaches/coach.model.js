const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const User = require('../users/user.model');

const Coach = sequelize.define('Coach', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    specialties: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    images: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    rating: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    }
}, {
    timestamps: true
});

Coach.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Coach, { foreignKey: 'userId' });

module.exports = Coach;
