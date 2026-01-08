const express = require('express');
const { getProducts, createOrder, getMyOrders, getCategories } = require('./store.controller');
const { protect } = require('../../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Store (Client)
 */

/**
 * @swagger
 * /api/store/products:
 *   get:
 *     summary: Get all products
 *     tags: [Store (Client)]
 *     responses:
 *       200:
 *         description: List of products
 */
router.get('/products', getProducts);
router.get('/categories', getCategories);

router.use(protect);

/**
 * @swagger
 * /api/store/orders:
 *   post:
 *     summary: Create an order
 *     tags: [Store (Client)]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *     responses:
 *       201:
 *         description: Order created
 *   get:
 *     summary: Get my orders
 *     tags: [Store (Client)]
 *     responses:
 *       200:
 *         description: List of orders
 */
router.route('/orders')
    .post(createOrder)
    .get(getMyOrders);

module.exports = router;
