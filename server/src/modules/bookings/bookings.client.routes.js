const express = require('express');
const {
    createBooking,
    getBookings,
    getMyBookings,
    getBooking,
    updateBooking,
    deleteBooking
} = require('./booking.controller');
const { joinWaitlist, leaveWaitlist, getMyWaitlist } = require('./waitlist.controller');
const { protect } = require('../../middleware/auth');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Bookings (Client)
 *   description: Booking management for users
 */

/**
 * @swagger
 * /api/bookings/waitlist:
 *   post:
 *     summary: Join waitlist for a slot
 *     tags: [Bookings (Client)]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - venueId
 *               - date
 *               - startTime
 *               - endTime
 *     responses:
 *       201:
 *         description: Joined waitlist
 *   get:
 *     summary: Get my waitlist
 *     tags: [Bookings (Client)]
 *     responses:
 *       200:
 *         description: List of waitlist entries
 */
router.route('/waitlist')
    .post(joinWaitlist)
    .get(getMyWaitlist);

/**
 * @swagger
 * /api/bookings/waitlist/{id}:
 *   delete:
 *     summary: Leave waitlist
 *     tags: [Bookings (Client)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Left waitlist successfully
 */
router.delete('/waitlist/:id', leaveWaitlist);

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a booking
 *     tags: [Bookings (Client)]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - venueId
 *     responses:
 *       201:
 *         description: Booking created
 */
router.post('/', createBooking);

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get bookings (filtered)
 *     tags: [Bookings (Client)]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of bookings
 */
router.get('/', getBookings);

/**
 * @swagger
 * /api/bookings/my-bookings:
 *   get:
 *     summary: Get my bookings
 *     tags: [Bookings (Client)]
 *     responses:
 *       200:
 *         description: List of my bookings
 */
router.get('/my-bookings', getMyBookings);

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [Bookings (Client)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Booking details
 *   put:
 *     summary: Update booking
 *     tags: [Bookings (Client)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Booking updated
 *   delete:
 *     summary: Delete booking
 *     tags: [Bookings (Client)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Booking deleted
 */
router.route('/:id')
    .get(getBooking)
    .put(updateBooking)
    .delete(deleteBooking);

module.exports = router;
