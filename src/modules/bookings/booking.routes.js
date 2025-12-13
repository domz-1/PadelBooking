const express = require('express');
const { createBooking, getBookings, getMyBookings, getBooking, getBookingLogs } = require('./booking.controller');
const { importBookings } = require('./import.controller');
const { protect, authorize } = require('../../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const { joinWaitlist, leaveWaitlist, getMyWaitlist } = require('./waitlist.controller');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /bookings/import:
 *   post:
 *     summary: Import bookings from file (Admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Bookings imported successfully
 */
router.post('/import', authorize('admin'), upload.single('file'), importBookings);

/**
 * @swagger
 * /bookings/logs:
 *   get:
 *     summary: Get booking logs (Admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: bookingId
 *         schema:
 *           type: integer
 *         description: Filter by booking ID
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *     responses:
 *       200:
 *         description: List of booking logs
 */
router.get('/logs', authorize('admin'), getBookingLogs);

// Waitlist Routes
/**
 * @swagger
 * /bookings/waitlist:
 *   post:
 *     summary: Join waitlist for a slot
 *     tags: [Bookings]
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
 *             properties:
 *               venueId:
 *                 type: integer
 *               date:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *                 format: time
 *               endTime:
 *                 type: string
 *                 format: time
 *     responses:
 *       201:
 *         description: Joined waitlist
 */
router.post('/waitlist', joinWaitlist);
router.post('/waitlist', joinWaitlist);

/**
 * @swagger
 * /bookings/waitlist:
 *   get:
 *     summary: Get my waitlist
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of waitlist entries
 */
router.get('/waitlist', getMyWaitlist);

/**
 * @swagger
 * /bookings/waitlist/{id}:
 *   delete:
 *     summary: Leave waitlist
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Waitlist ID
 *     responses:
 *       200:
 *         description: Left waitlist successfully
 */
router.delete('/waitlist/:id', leaveWaitlist);

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a booking
 *     tags: [Bookings]
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
 *             properties:
 *               venueId:
 *                 type: integer
 *               date:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *                 format: time
 *               endTime:
 *                 type: string
 *                 format: time
 *     responses:
 *       201:
 *         description: Booking created
 */
router.route('/')
    .post(createBooking)
    /**
     * @swagger
     * /bookings:
     *   get:
     *     summary: Get all bookings (Admin only)
     *     tags: [Bookings]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: List of bookings
     */
    .get(authorize('admin'), getBookings);

/**
 * @swagger
 * /bookings/my-bookings:
 *   get:
 *     summary: Get my bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of my bookings
 */
router.get('/my-bookings', getMyBookings);

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking details
 *       404:
 *         description: Booking not found
 */
router.get('/:id', getBooking);

module.exports = router;
