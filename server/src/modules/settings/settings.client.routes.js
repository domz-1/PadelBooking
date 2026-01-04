const express = require('express');
const { getConfig, getCategories, getBookingStatuses } = require('./settings.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Settings (Client)
 */

/**
 * @swagger
 * /api/settings/config:
 *   get:
 *     summary: Get system configuration
 *     tags: [Settings (Client)]
 *     responses:
 *       200:
 *         description: System configuration
 */
router.get('/config', getConfig);

/**
 * @swagger
 * /api/settings/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Settings (Client)]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/categories', getCategories);

/**
 * @swagger
 * /api/settings/booking-statuses:
 *   get:
 *     summary: Get all booking statuses
 *     tags: [Settings (Client)]
 *     responses:
 *       200:
 *         description: List of booking statuses
 */
router.get('/booking-statuses', getBookingStatuses);

module.exports = router;
