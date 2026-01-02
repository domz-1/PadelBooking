const express = require('express');
const { getVenues, getVenue } = require('./venue.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Venues (Client)
 */

/**
 * @swagger
 * /api/venues:
 *   get:
 *     summary: Get all venues
 *     tags: [Venues (Client)]
 *     parameters:
 *       - in: query
 *         name: search
 *     responses:
 *       200:
 *         description: List of venues
 */
router.get('/', getVenues);

/**
 * @swagger
 * /api/venues/{id}:
 *   get:
 *     summary: Get venue by ID
 *     tags: [Venues (Client)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Venue details
 */
router.get('/:id', getVenue);

module.exports = router;
