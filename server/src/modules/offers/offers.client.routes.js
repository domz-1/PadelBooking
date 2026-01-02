const express = require('express');
const { getOffers } = require('./offer.controller');

const router = express.Router();

// Public route or protected? Original was public getter, admin setter.
// Original: router.route('/').get(getOffers).post(...)
// So getter is public.

/**
 * @swagger
 * tags:
 *   name: Offers (Client)
 */

/**
 * @swagger
 * /api/offers:
 *   get:
 *     summary: Get all offers
 *     tags: [Offers (Client)]
 *     responses:
 *       200:
 *         description: List of offers
 */
router.get('/', getOffers);

module.exports = router;
