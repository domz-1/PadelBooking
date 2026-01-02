const express = require('express');
const { createOffer, deleteOffer, getAllOffers } = require('./offer.controller');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

/**
 * @swagger
 * tags:
 *   name: Offers (Admin)
 */

/**
 * @swagger
 * /admin/offers:
 *   get:
 *     summary: Get all offers (Paginated)
 *     tags: [Offers (Admin)]
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
 *     responses:
 *       200:
 *         description: List of offers
 *   post:
 *     summary: Create an offer
 *     tags: [Offers (Admin)]
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
    .get(getAllOffers)
    .post(createOffer);

/**
 * @swagger
 * /admin/offers/{id}:
 *   delete:
 *     summary: Delete offer
 *     tags: [Offers (Admin)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Offer deleted
 */
router.delete('/:id', deleteOffer);

module.exports = router;
