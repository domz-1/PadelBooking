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
    name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('image');
            const baseUrl = process.env.BASE_URL || 'http://localhost:4000';
            if (!rawValue) return `${baseUrl}/placeholder/padel-coach-2.png`;
            if (rawValue.startsWith('http')) return rawValue;
            return `${baseUrl}/${rawValue.replace(/\\/g, '/')}`;
        }
    },
    specialties: {
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
