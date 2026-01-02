const express = require('express');
const {
    updateConfig,
    getAnalysis,
    createCategory,
    updateCategory,
    deleteCategory,
    getConfig,
    getCategories
} = require('./settings.controller');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

/**
 * @swagger
 * tags:
 *   name: Settings (Admin)
 */

/**
 * @swagger
 * /admin/settings/config:
 *   get:
 *     summary: Get system configuration
 *     tags: [Settings (Admin)]
 *     responses:
 *       200:
 *         description: System configuration
 *   put:
 *     summary: Update system configuration
 *     tags: [Settings (Admin)]
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
router.route('/config')
    .get(getConfig)
    .put(updateConfig);

/**
 * @swagger
 * /admin/settings/analysis:
 *   get:
 *     summary: Get system analysis
 *     tags: [Settings (Admin)]
 *     responses:
 *       200:
 *         description: System analysis data
 */
router.get('/analysis', getAnalysis);

/**
 * @swagger
 * /admin/settings/categories:
 *   post:
 *     summary: Create a category
 *     tags: [Settings (Admin)]
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
router.post('/categories', createCategory);

/**
 * @swagger
 * /admin/settings/categories/{id}:
 *   put:
 *     summary: Update category
 *     tags: [Settings (Admin)]
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
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated
 *   delete:
 *     summary: Delete category
 *     tags: [Settings (Admin)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Category deleted
 */
router.route('/categories/:id')
    .put(updateCategory)
    .delete(deleteCategory);

module.exports = router;
