const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../config/database');

const Sponsor = sequelize.define('Sponsor', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        allowNull: false,
        get() {
            const rawValue = this.getDataValue('image');
            if (!rawValue) return null;
            if (rawValue.startsWith('http')) return rawValue;
            const baseUrl = process.env.BASE_URL || 'http://localhost:4000';
            return `${baseUrl}/${rawValue.replace(/\\/g, '/')}`;
        }
    },
    link: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    showInHome: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});

module.exports = Sponsor;
