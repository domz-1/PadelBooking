const express = require('express');
const { getSports, getSport } = require('./sport.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Sports (Client)
 */

/**
 * @swagger
 * /api/sports:
 *   get:
 *     summary: Get all sports
 *     tags: [Sports (Client)]
 *     responses:
 *       200:
 *         description: List of sports
 */
router.get('/', getSports);

/**
 * @swagger
 * /api/sports/{id}:
 *   get:
 *     summary: Get sport by ID
 *     tags: [Sports (Client)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Sport details
 */
router.get('/:id', getSport);

module.exports = router;
