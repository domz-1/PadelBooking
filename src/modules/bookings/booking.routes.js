const express = require('express');
const { getBookings, getBooking, createBooking } = require('./booking.controller');
const { protect } = require('../../middleware/auth');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management
 */

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get bookings
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: List of bookings
 *   post:
 *     summary: Create a booking
 *     tags: [Bookings]
 *     responses:
 *       201:
 *         description: Booking created
 */
router.route('/')
    .get(getBookings)
    .post(createBooking);

router.route('/:id')
    .get(getBooking);

module.exports = router;
