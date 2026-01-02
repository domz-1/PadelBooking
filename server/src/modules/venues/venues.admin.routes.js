const express = require('express');
const { createVenue, updateVenue, deleteVenue, getVenues, getVenue } = require('./venue.controller');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

/**
 * @swagger
 * tags:
 *   name: Venues (Admin)
 */

/**
 * @swagger
 * /admin/venues:
 *   get:
 *     summary: Get all venues
 *     tags: [Venues (Admin)]
 *     responses:
 *       200:
 *         description: List of venues
 *   post:
 *     summary: Create a new venue
 *     tags: [Venues (Admin)]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - location
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Venue created
 */
router.route('/')
    .get(getVenues)
    .post(createVenue);

/**
 * @swagger
 * /admin/venues/{id}:
 *   get:
 *     summary: Get venue by ID
 *     tags: [Venues (Admin)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Venue details
 *   put:
 *     summary: Update venue
 *     tags: [Venues (Admin)]
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
 *         description: Venue updated
 *   delete:
 *     summary: Delete venue
 *     tags: [Venues (Admin)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Venue deleted
 */
router.route('/:id')
    .get(getVenue)
    .put(updateVenue)
    .delete(deleteVenue);

module.exports = router;
