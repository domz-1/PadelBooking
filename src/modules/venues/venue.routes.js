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
    /**
     * @swagger
     * /venues:
     *   post:
     *     summary: Create a new venue (Admin only)
     *     tags: [Venues]
     *     security:
     *       - bearerAuth: []
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
     *         description: Venue created successfully
     */
    .post(protect, authorize('admin'), createVenue);

/**
 * @swagger
 * /venues/{id}:
 *   get:
 *     summary: Get venue by ID
 *     tags: [Venues]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Venue ID
 *     responses:
 *       200:
 *         description: Venue details
 *       404:
 *         description: Venue not found
 *   put:
 *     summary: Update venue (Admin only)
 *     tags: [Venues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Venue ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Venue updated successfully
 *   delete:
 *     summary: Delete venue (Admin only)
 *     tags: [Venues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Venue ID
 *     responses:
 *       200:
 *         description: Venue deleted successfully
 */
router.route('/:id')
    .get(getVenue)
    .put(protect, authorize('admin'), updateVenue)
    .delete(protect, authorize('admin'), deleteVenue);

module.exports = router;
