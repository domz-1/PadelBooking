const express = require('express');
const { getSponsors, getSponsor } = require('./sponsor.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Sponsors (Client)
 */

/**
 * @swagger
 * /api/sponsors:
 *   get:
 *     summary: Get all active sponsors
 *     tags: [Sponsors (Client)]
 *     responses:
 *       200:
 *         description: List of sponsors
 */
router.get('/', getSponsors);

/**
 * @swagger
 * /api/sponsors/{id}:
 *   get:
 *     summary: Get sponsor by ID
 *     tags: [Sponsors (Client)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Sponsor details
 */
router.get('/:id', getSponsor);

module.exports = router;
