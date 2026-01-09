const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../config/database');
const User = require('../users/user.model');

const Chat = sequelize.define('Chat', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true
});

Chat.belongsTo(User, { as: 'Sender', foreignKey: 'senderId' });
Chat.belongsTo(User, { as: 'Receiver', foreignKey: 'receiverId' });

module.exports = Chat;
