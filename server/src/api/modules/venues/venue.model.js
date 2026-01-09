const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../config/database');

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

    contactEmail: {
        type: DataTypes.STRING,
        allowNull: true
    },
    contactPhone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    amenities: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    images: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
        get() {
            const rawValue = this.getDataValue('images');
            if (!rawValue || !Array.isArray(rawValue)) return [];
            const baseUrl = process.env.BASE_URL || 'http://localhost:4000';
            return rawValue.map(path => {
                if (!path) return path;
                if (path.startsWith('http')) return path;
                return `${baseUrl}/${path.replace(/\\/g, '/')}`;
            });
        }
    },
    branchId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Initially true to allow migration of existing venues, but should be false eventually
        references: {
            model: 'Branches',
            key: 'id'
        }
    },
    order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    blockedPeriods: {
        type: DataTypes.JSONB, // Array of { startTime: 'HH:mm', endTime: 'HH:mm', days: number[] }
        defaultValue: []
    }
}, {
    timestamps: true
});

const Branch = require('../branches/branch.model');
Venue.belongsTo(Branch, { foreignKey: 'branchId' });
Branch.hasMany(Venue, { foreignKey: 'branchId' });

module.exports = Venue;
