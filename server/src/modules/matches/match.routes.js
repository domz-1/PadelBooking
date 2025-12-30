const express = require('express');
const { createMatch, getOpenMatches, joinMatch, handleRequest } = require('./match.controller');
const { protect } = require('../../middleware/auth');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Matches
 *   description: Match management
 */

/**
 * @swagger
 * /matches:
 *   get:
 *     summary: Get open matches
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of open matches
 *   post:
 *     summary: Create a match
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - venueId
 *               - date
 *               - startTime
 *             properties:
 *               venueId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *                 format: time
 *     responses:
 *       201:
 *         description: Match created
 */
router.route('/')
    .get(getOpenMatches)
    .post(createMatch);

/**
 * @swagger
 * /matches/{id}/join:
 *   post:
 *     summary: Join a match
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *     responses:
 *       200:
 *         description: Joined match successfully
 */
router.post('/:id/join', joinMatch);

/**
 * @swagger
 * /matches/requests/{requestId}:
 *   put:
 *     summary: Handle match request
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [accepted, rejected]
 *     responses:
 *       200:
 *         description: Request handled
 */
router.put('/requests/:requestId', handleRequest);

module.exports = router;
