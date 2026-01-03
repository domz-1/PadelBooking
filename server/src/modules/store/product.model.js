const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('sale', 'rental'),
        defaultValue: 'sale'
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0
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

module.exports = Product;
