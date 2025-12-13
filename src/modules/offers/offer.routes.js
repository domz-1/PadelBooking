const express = require('express');
const { getOffers, createOffer, deleteOffer } = require('./offer.controller');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Offers
 *   description: Offer management
 */

/**
 * @swagger
 * /offers:
 *   get:
 *     summary: Get all offers
 *     tags: [Offers]
 *     responses:
 *       200:
 *         description: List of offers
 *   post:
 *     summary: Create an offer (Admin only)
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Offer created
 */
router.route('/')
    .get(getOffers)
    .post(protect, authorize('admin'), createOffer);

/**
 * @swagger
 * /offers/{id}:
 *   delete:
 *     summary: Delete offer (Admin only)
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Offer ID
 *     responses:
 *       200:
 *         description: Offer deleted
 */
router.route('/:id')
    .delete(protect, authorize('admin'), deleteOffer);

module.exports = router;
