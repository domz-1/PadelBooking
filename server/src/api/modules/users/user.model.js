const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../config/database');
const bcrypt = require('bcryptjs');

const normalizePhone = (phone) => {
    if (!phone) return null;
    // Remove all non-digit characters except +
    let normalized = phone.replace(/[^\d+]/g, '');

    // If it starts with 01 (Egypt local), change to +201
    if (normalized.startsWith('01') && normalized.length === 11) {
        normalized = '+2' + normalized;
    }

    // Ensure no spaces or extra formatting remains
    return normalized;
};

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
            const baseUrl = process.env.BASE_URL || 'http://localhost:4000';
            if (!rawValue) return `${baseUrl}/placeholder/padel-user.png`;
            if (rawValue.startsWith('http')) return rawValue;
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
            if (user.phone) {
                user.phone = normalizePhone(user.phone);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
            if (user.changed('phone') && user.phone) {
                user.phone = normalizePhone(user.phone);
            }
        }
    }
});

User.prototype.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;
