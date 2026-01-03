const Product = require('./product.model');
const Order = require('./order.model');
const OrderItem = require('./orderItem.model');

exports.getProducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { type } = req.query;
        const where = {};
        if (type) where.type = type;

        const { count, rows } = await Product.findAndCountAll({
            where,
            limit,
            offset
        });

        res.status(200).json({
            success: true,
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            data: rows
        });
    } catch (error) {
        next(error);
    }
};

exports.createProduct = async (req, res, next) => {
    try {
        if (req.file) {
            req.body.image = req.file.path;
        }
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, data: product, message: req.t('success') });
    } catch (error) {
        next(error);
    }
};

exports.updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: req.t('notFound') });
        }
        if (req.file) {
            req.body.image = req.file.path;
        }
        await product.update(req.body);
        res.status(200).json({ success: true, data: product, message: req.t('success') });
    } catch (error) {
        next(error);
    }
};

exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: req.t('notFound') });
        }
        await product.destroy();
        res.status(200).json({ success: true, data: {}, message: req.t('success') });
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

exports.getAllOrders = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Order.findAndCountAll({
            include: [{ model: OrderItem, include: [Product] }],
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            data: rows
        });
    } catch (error) {
        next(error);
    }
};

exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const order = await Order.findByPk(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: req.t('notFound') });
        }
        await order.update({ status });
        res.status(200).json({ success: true, data: order, message: req.t('success') });
    } catch (error) {
        next(error);
    }
};
