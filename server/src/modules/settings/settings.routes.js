const express = require('express');
const {
    getConfig, updateConfig,
    getCategories, createCategory, updateCategory, deleteCategory
} = require('./settings.controller');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: System settings and configuration
 */

// Config Routes
/**
 * @swagger
 * /settings/config:
 *   get:
 *     summary: Get system configuration
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: System configuration
 *   put:
 *     summary: Update system configuration (Admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Configuration updated
 */
router.get('/config', getConfig);
router.put('/config', protect, authorize('admin'), updateConfig);

// Analysis Route
/**
 * @swagger
 * /settings/analysis:
 *   get:
 *     summary: Get system analysis (Admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System analysis data
 */
router.get('/analysis', protect, authorize('admin'), require('./settings.controller').getAnalysis);

// Category Routes
/**
 * @swagger
 * /settings/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: List of categories
 *   post:
 *     summary: Create a category (Admin only)
 *     tags: [Settings]
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
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created
 */
router.route('/categories')
    .get(getCategories)
    .post(protect, authorize('admin'), createCategory);

/**
 * @swagger
 * /settings/categories/{id}:
 *   put:
 *     summary: Update category (Admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated
 *   delete:
 *     summary: Delete category (Admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted
 */
router.route('/categories/:id')
    .put(protect, authorize('admin'), updateCategory)
    .delete(protect, authorize('admin'), deleteCategory);

module.exports = router;
