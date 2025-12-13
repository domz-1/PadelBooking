const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const User = require('../users/user.model');

const Story = sequelize.define('Story', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    mediaUrl: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('image', 'video'),
        defaultValue: 'image'
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    timestamps: true
});

Story.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Story, { foreignKey: 'userId' });

module.exports = Story;
