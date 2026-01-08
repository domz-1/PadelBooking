const Product = require('./product.model');
const Order = require('./order.model');
const OrderItem = require('./orderItem.model');
const Category = require('./category.model');
const User = require('../users/user.model');
const axios = require('axios'); // For Telegram
const csv = require('csv-parser');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');


exports.getProducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { type, showInLanding, categoryId, search, isActive } = req.query;
        const where = {};
        if (type) where.type = type;
        if (showInLanding === 'true') where.showInLanding = true;
        if (categoryId) where.categoryId = categoryId;

        // Default to active only for non-admin or if not specified
        if (isActive !== undefined) {
            where.isActive = isActive === 'true';
        } else if (req.user?.role !== 'admin') {
            where.isActive = true;
        }

        if (search) {
            const { Op } = require('sequelize');
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } }
            ];
        }

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
            include: [
                { model: User, attributes: ['id', 'name', 'email', 'phone'] },
                { model: OrderItem, include: [Product] }
            ],
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

// Category Controllers
exports.getCategories = async (req, res, next) => {
    try {
        const categories = await Category.findAll();
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        next(error);
    }
};

exports.createCategory = async (req, res, next) => {
    try {
        if (req.file) {
            req.body.image = req.file.path;
        }
        const category = await Category.create(req.body);
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        next(error);
    }
};

exports.updateCategory = async (req, res, next) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        if (req.file) {
            req.body.image = req.file.path;
        }
        await category.update(req.body);
        res.status(200).json({ success: true, data: category });
    } catch (error) {
        next(error);
    }
};

// Telegram Helper
const sendTelegramNotification = async (order, user, items) => {
    try {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;
        if (!botToken || !chatId) return;

        let message = `🆕 *New Order Received!*\n\n`;
        message += `👤 *Customer:* ${user.name}\n`;
        message += `📧 *Email:* ${user.email}\n`;
        message += `💰 *Total Amount:* ${order.totalAmount} EGP\n`;
        message += `💳 *Payment:* ${order.paymentMethod}\n\n`;
        message += `🛒 *Items:*\n`;

        items.forEach(item => {
            message += `- ${item.productName} x${item.quantity} (${item.price} EGP)\n`;
        });

        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        await axios.post(url, {
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown'
        });
    } catch (error) {
        console.error('Telegram notification failed:', error);
    }
};

// Update createOrder to include Telegram notification
exports.createOrder = async (req, res, next) => {
    try {
        const { items, paymentMethod, bookingId } = req.body;
        let totalAmount = 0;
        const orderItemsData = [];
        const fullItemsForNotify = [];

        for (const item of items) {
            const product = await Product.findByPk(item.productId);
            if (!product) return res.status(404).json({ success: false, message: `Product ${item.productId} not found` });
            if (product.stock < item.quantity) return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });

            const price = product.isPriceless ? 0 : product.price;
            totalAmount += price * item.quantity;
            orderItemsData.push({ productId: product.id, quantity: item.quantity, price });
            fullItemsForNotify.push({ productName: product.name, quantity: item.quantity, price });
        }

        const order = await Order.create({
            userId: req.user.id,
            totalAmount,
            paymentMethod,
            bookingId: bookingId || null,
            status: 'pending'
        });

        for (const itemData of orderItemsData) {
            await OrderItem.create({ orderId: order.id, ...itemData });
            const product = await Product.findByPk(itemData.productId);
            await product.decrement('stock', { by: itemData.quantity });
        }

        // Send Telegram notification
        await sendTelegramNotification(order, req.user, fullItemsForNotify);

        res.status(201).json({ success: true, data: order, message: 'Order placed successfully' });
    } catch (error) {
        next(error);
    }
};

exports.bulkImportProducts = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const filePath = req.file.path;
        const ext = path.extname(req.file.originalname).toLowerCase();
        let productsArr = [];

        if (ext === '.csv') {
            productsArr = await new Promise((resolve, reject) => {
                const results = [];
                fs.createReadStream(filePath)
                    .pipe(csv())
                    .on('data', (data) => results.push(data))
                    .on('end', () => resolve(results))
                    .on('error', (err) => reject(err));
            });
        } else if (ext === '.xlsx' || ext === '.xls') {
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            productsArr = xlsx.utils.sheet_to_json(sheet);
        } else {
            return res.status(400).json({ success: false, message: 'Unsupported file format' });
        }

        const createdProducts = [];
        for (const p of productsArr) {
            // Map common field names
            const productData = {
                name: p.name || p.Name || p.title || p.Title,
                description: p.description || p.Description || p.info || p.Info,
                price: parseFloat(p.price || p.Price || 0),
                stock: parseInt(p.stock || p.Stock || p.quantity || p.Quantity || 0),
                isPriceless: (p.isPriceless || p.Priceless) === 'true' || (p.isPriceless || p.Priceless) === true,
                showInLanding: (p.showInLanding || p.ShowInLanding) === 'true' || (p.showInLanding || p.ShowInLanding) === true,
                categoryId: p.categoryId || p.category || p.Category || null,
                isActive: true, // Default to true for imports
                image: 'images/product-padel.png' // Default placeholder as requested
            };

            if (productData.name) {
                const created = await Product.create(productData);
                createdProducts.push(created);
            }
        }

        // Clean up uploaded file
        fs.unlinkSync(filePath);

        res.status(200).json({
            success: true,
            count: createdProducts.length,
            message: `${createdProducts.length} products imported successfully`
        });
    } catch (error) {
        next(error);
    }
};

