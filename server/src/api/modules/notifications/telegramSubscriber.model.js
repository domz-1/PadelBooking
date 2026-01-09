const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../config/database');

const TelegramSubscriber = sequelize.define('TelegramSubscriber', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    chatId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    language: {
        type: DataTypes.STRING,
        defaultValue: 'en'
    }
}, {
    timestamps: true
});

module.exports = TelegramSubscriber;
