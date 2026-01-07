const express = require('express');
const { getPublicBookings } = require('./booking.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Bookings (Public)
 *   description: Public booking endpoints for non-authenticated users
 */

/**
 * @swagger
 * /api/public/bookings:
 *   get:
 *     summary: Get public bookings (for grid view)
 *     tags: [Bookings (Public)]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *         required: true
 *         description: Date in YYYY-MM-DD format
 *     responses:
 *       200:
 *         description: List of bookings for the specified date
 *       400:
 *         description: Date parameter is required
 */
router.get('/', getPublicBookings);

module.exports = router;
