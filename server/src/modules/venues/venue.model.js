const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Venue = sequelize.define('Venue', {
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
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    pricePerHour: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    amenities: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    images: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    }
}, {
    timestamps: true
});

module.exports = Venue;
