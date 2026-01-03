const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Branch = sequelize.define('Branch', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
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
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});

module.exports = Branch;
