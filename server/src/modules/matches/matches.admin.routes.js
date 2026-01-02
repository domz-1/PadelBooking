const express = require('express');
const { deleteMatch, getAllMatches } = require('./match.controller');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

/**
 * @swagger
 * tags:
 *   name: Matches (Admin)
 */

/**
 * @swagger
 * /admin/matches:
 *   get:
 *     summary: Get all matches
 *     tags: [Matches (Admin)]
 *     responses:
 *       200:
 *         description: List of all matches
 */
router.get('/', getAllMatches);

/**
 * @swagger
 * /admin/matches/{id}:
 *   delete:
 *     summary: Delete match
 *     tags: [Matches (Admin)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Match deleted
 */
router.delete('/:id', deleteMatch);

module.exports = router;
