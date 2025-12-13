const Product = require('./product.model');
const Order = require('./order.model');
const OrderItem = require('./orderItem.model');

exports.getProducts = async (req, res, next) => {
    try {
        const { type } = req.query;
        const where = {};
        if (type) where.type = type;

        const products = await Product.findAll({ where });
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        next(error);
    }
};

exports.createProduct = async (req, res, next) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, data: product, message: req.t('success') });
    } catch (error) {
        next(error);
    }
};

exports.createOrder = async (req, res, next) => {
    try {
        const { items, paymentMethod, bookingId } = req.body; // items: [{ productId, quantity }], bookingId optional

        let totalAmount = 0;
        const orderItemsData = [];

        // Validate items and calculate total
        for (const item of items) {
            const product = await Product.findByPk(item.productId);
            if (!product) {
                return res.status(404).json({ success: false, message: `Product ${item.productId} not found` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
            }

            totalAmount += product.price * item.quantity;
            orderItemsData.push({
                productId: product.id,
                quantity: item.quantity,
                price: product.price
            });
        }

        const order = await Order.create({
            userId: req.user.id,
            totalAmount,
            paymentMethod,
            bookingId: bookingId || null,
            status: 'completed' // Auto-complete for now
        });

        for (const itemData of orderItemsData) {
            await OrderItem.create({
                orderId: order.id,
                ...itemData
            });
            // Deduct stock
            const product = await Product.findByPk(itemData.productId);
            await product.decrement('stock', { by: itemData.quantity });
        }

        res.status(201).json({ success: true, data: order, message: req.t('success') });
    } catch (error) {
        next(error);
    }
};

exports.getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.findAll({
            where: { userId: req.user.id },
            include: [{ model: OrderItem, include: [Product] }]
        });
        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        next(error);
    }
};
