const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const Coach = require('./coach.model');

const Package = sequelize.define('Package', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    sessions: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    }
}, {
    timestamps: true
});

Package.belongsTo(Coach, { foreignKey: 'coachId' });
Coach.hasMany(Package, { foreignKey: 'coachId' });

module.exports = Package;
