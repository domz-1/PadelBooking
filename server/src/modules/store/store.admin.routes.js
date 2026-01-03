const express = require('express');
const { createProduct, updateProduct, deleteProduct, getAllOrders, updateOrderStatus } = require('./store.controller');
const { protect, authorize } = require('../../middleware/auth');
const { upload, convertImage } = require('../../middleware/upload');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

/**
 * @swagger
 * tags:
 *   name: Store (Admin)
 */

/**
 * @swagger
 * /admin/store/products:
 *   post:
 *     summary: Create a product
 *     tags: [Store (Admin)]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
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
router.post('/products', upload.single('image'), convertImage, createProduct);

/**
 * @swagger
 * /admin/store/products/{id}:
 *   put:
 *     summary: Update product
 *     tags: [Store (Admin)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Product updated
 *   delete:
 *     summary: Delete product
 *     tags: [Store (Admin)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Product deleted
 */
router.route('/products/:id')
    .put(upload.single('image'), convertImage, updateProduct)
    .delete(deleteProduct);

/**
 * @swagger
 * /admin/store/orders:
 *   get:
 *     summary: Get all orders (Paginated)
 *     tags: [Store (Admin)]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of orders
 */
router.get('/orders', getAllOrders);

/**
 * @swagger
 * /admin/store/orders/{id}:
 *   put:
 *     summary: Update order status
 *     tags: [Store (Admin)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order updated
 */
router.put('/orders/:id', updateOrderStatus);

module.exports = router;
