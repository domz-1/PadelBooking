const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const User = require('../users/user.model');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
        defaultValue: 'pending'
    },
    paymentMethod: {
        type: DataTypes.STRING,
        defaultValue: 'cash' // cash, card, etc.
    },
    bookingId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Bookings',
            key: 'id'
        }
    }
}, {
    timestamps: true
});

Order.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Order, { foreignKey: 'userId' });

// We will add the Booking association in the main association setup or here if Booking is loaded
// For now, let's keep it simple.


module.exports = Order;
