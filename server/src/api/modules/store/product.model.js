const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../config/database');

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
        allowNull: true
    },
    isPriceless: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    showInLanding: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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
            const baseUrl = process.env.BASE_URL || 'http://localhost:4000';
            if (!rawValue) return `${baseUrl}/placeholder/product-padel.png`;
            if (rawValue.startsWith('http')) return rawValue;
            return `${baseUrl}/${rawValue.replace(/\\/g, '/')}`;
        }
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});

const Category = require('./category.model');
Product.belongsTo(Category, { foreignKey: 'categoryId' });
Category.hasMany(Product, { foreignKey: 'categoryId' });

module.exports = Product;
