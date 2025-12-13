const express = require('express');
const { getSports, getSport, createSport, updateSport, deleteSport } = require('./sport.controller');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Sports
 *   description: Sports management
 */

/**
 * @swagger
 * /sports:
 *   get:
 *     summary: Get all sports
 *     tags: [Sports]
 *     responses:
 *       200:
 *         description: List of sports
 */
router.route('/')
    .get(getSports)
    .post(protect, authorize('admin'), createSport);

router.route('/:id')
    .get(getSport)
    .put(protect, authorize('admin'), updateSport)
    .delete(protect, authorize('admin'), deleteSport);

module.exports = router;
