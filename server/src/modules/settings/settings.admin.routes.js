const express = require('express');
const {
    updateConfig,
    getAnalysis,
    createCategory,
    updateCategory,
    deleteCategory,
    getConfig,
    getCategories,
    getBookingStatuses,
    createBookingStatus,
    updateBookingStatus,
    deleteBookingStatus,
    uploadLogo
} = require('./settings.controller');
const { protect, authorize } = require('../../middleware/auth');
const { upload, convertImage } = require('../../middleware/upload');

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

router.post('/config/logo', upload.single('logo'), convertImage, uploadLogo);

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
router.route('/categories')
    .get(getCategories)
    .post(createCategory);

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

/**
 * @swagger
 * /admin/settings/booking-statuses:
 *   get:
 *     summary: Get all booking statuses
 *     tags: [Settings (Admin)]
 *     responses:
 *       200:
 *         description: List of booking statuses
 *   post:
 *     summary: Create a booking status
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
 *               color:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Booking status created
 */
router.route('/booking-statuses')
    .get(getBookingStatuses)
    .post(createBookingStatus);

/**
 * @swagger
 * /admin/settings/booking-statuses/{id}:
 *   put:
 *     summary: Update booking status
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
 *               color:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking status updated
 *   delete:
 *     summary: Delete booking status
 *     tags: [Settings (Admin)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Booking status deleted
 */
router.route('/booking-statuses/:id')
    .put(updateBookingStatus)
    .delete(deleteBookingStatus);

module.exports = router;
