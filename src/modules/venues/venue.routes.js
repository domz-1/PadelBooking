const express = require('express');
const { getVenues, getVenue, createVenue, updateVenue, deleteVenue } = require('./venue.controller');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Venues
 *   description: Venue management
 */

/**
 * @swagger
 * /venues:
 *   get:
 *     summary: Get all venues
 *     tags: [Venues]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name
 *     responses:
 *       200:
 *         description: List of venues
 */
router.route('/')
    .get(getVenues)
    .post(protect, authorize('admin'), createVenue);

router.route('/:id')
    .get(getVenue)
    .put(protect, authorize('admin'), updateVenue)
    .delete(protect, authorize('admin'), deleteVenue);

module.exports = router;
