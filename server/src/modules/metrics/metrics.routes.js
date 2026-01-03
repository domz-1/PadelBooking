const express = require('express');
const { getStats, getAvailableSlots } = require('./metrics.controller');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'super-admin'));

/**
 * @swagger
 * tags:
 *   name: Metrics (Admin)
 */

/**
 * @swagger
 * /admin/metrics/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Metrics (Admin)]
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.get('/stats', getStats);

/**
 * @swagger
 * /admin/metrics/available-slots:
 *   get:
 *     summary: Get available slots for a specific date and range
 *     tags: [Metrics (Admin)]
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *       - in: query
 *         name: startTime
 *       - in: query
 *         name: endTime
 *       - in: query
 *         name: branchId
 *     responses:
 *       200:
 *         description: Available slots grouped by branch and venue
 */
router.get('/available-slots', getAvailableSlots);

module.exports = router;
