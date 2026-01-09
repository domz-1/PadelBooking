const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../config/database');

const Offer = sequelize.define('Offer', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    discountPercentage: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    validUntil: {
        type: DataTypes.DATE,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('image');
            if (!rawValue) return null;
            if (rawValue.startsWith('http')) return rawValue;
            const baseUrl = process.env.BASE_URL || 'http://localhost:4000';
            return `${baseUrl}/${rawValue.replace(/\\/g, '/')}`;
        }
    }
}, {
    timestamps: true
});

module.exports = Offer;
