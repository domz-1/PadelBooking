const express = require('express');
const { getProducts, createProduct, createOrder, getMyOrders } = require('./store.controller');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Store
 *   description: Store and Rentals management
 */

/**
 * @swagger
 * /store/products:
 *   get:
 *     summary: Get all products
 *     tags: [Store]
 *     responses:
 *       200:
 *         description: List of products
 */
router.get('/products', getProducts);

router.use(protect);

/**
 * @swagger
 * /store/products:
 *   post:
 *     summary: Create a product (Admin only)
 *     tags: [Store]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Product created
 */
router.post('/products', authorize('admin'), createProduct);

/**
 * @swagger
 * /store/orders:
 *   post:
 *     summary: Create an order
 *     tags: [Store]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Order created
 *   get:
 *     summary: Get my orders
 *     tags: [Store]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 */
router.post('/orders', createOrder);
router.get('/orders', getMyOrders);

module.exports = router;
