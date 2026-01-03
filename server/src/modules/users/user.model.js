const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('user', 'admin', 'coach'),
        defaultValue: 'user'
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
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
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    stats: {
        type: DataTypes.JSONB, // { played: 0, won: 0, lost: 0 }
        defaultValue: { played: 0, won: 0, lost: 0 }
    }
}, {
    timestamps: true,
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

User.prototype.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;
