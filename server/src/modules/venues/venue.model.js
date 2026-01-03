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
    },
    branchId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Initially true to allow migration of existing venues, but should be false eventually
        references: {
            model: 'Branches',
            key: 'id'
        }
    }
}, {
    timestamps: true
});

const Branch = require('../branches/branch.model');
Venue.belongsTo(Branch, { foreignKey: 'branchId' });
Branch.hasMany(Venue, { foreignKey: 'branchId' });

module.exports = Venue;
