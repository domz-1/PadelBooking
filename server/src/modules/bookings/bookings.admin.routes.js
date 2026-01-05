const express = require('express');
const {
    getBookings,
    getBookingLogs,
    getDailySummary,
    getBooking,
    updateBooking,
    deleteBooking,
    createBooking,
    getFreeSlots
} = require('./booking.controller');
const { importExcel } = require('./import.controller');
const {
    getWaitlistForSlot,
    adminJoinWaitlist,
    adminDeleteWaitlist,
    getDailyWaitlist
} = require('./waitlist.controller');
const { protect, authorize } = require('../../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

/**
 * @swagger
 * tags:
 *   name: Bookings (Admin)
 *   description: Booking management for admins
 */

/**
 * @swagger
 * /admin/bookings:
 *   get:
 *     summary: Get all bookings
 *     tags: [Bookings (Admin)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings
 */
router.get('/', getBookings);
router.post('/', createBooking);

/**
 * @swagger
 * /admin/bookings/import:
 *   post:
 *     summary: Import bookings from file
 *     tags: [Bookings (Admin)]
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
router.post('/import', upload.single('file'), importExcel);

/**
 * @swagger
 * /admin/bookings/logs:
 *   get:
 *     summary: Get booking logs
 *     tags: [Bookings (Admin)]
 *     security:
 *       - bearerAuth: []
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
 *         description: List of booking logs
 */
router.get('/logs', getBookingLogs);

/**
 * @swagger
 * /admin/bookings/waitlist/slot:
 *   get:
 *     summary: Get waitlist for a specific slot
 *     tags: [Bookings (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: venueId
 *       - in: query
 *         name: date
 *       - in: query
 *         name: startTime
 *       - in: query
 *         name: endTime
 *     responses:
 *       200:
 *         description: List of waitlist entries
 */
router.get('/waitlist/slot', getWaitlistForSlot);
router.get('/waitlist/daily', getDailyWaitlist);
router.post('/waitlist', adminJoinWaitlist);
router.delete('/waitlist/:id', adminDeleteWaitlist);

/**
 * @swagger
 * /admin/bookings/daily-summary:
 *   get:
 *     summary: Get daily booking summary
 *     tags: [Bookings (Admin)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daily summary data
 */
router.get('/daily-summary', getDailySummary);
router.get('/free-slots', getFreeSlots);

/**
 * @swagger
 * /admin/bookings/{id}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [Bookings (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Booking details
 *   put:
 *     summary: Update booking
 *     tags: [Bookings (Admin)]
 *     security:
 *       - bearerAuth: []
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
 *         description: Booking updated
 *   delete:
 *     summary: Delete booking
 *     tags: [Bookings (Admin)]
 *     security:
 *       - bearerAuth: []
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
