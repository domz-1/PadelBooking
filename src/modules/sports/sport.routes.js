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
    /**
     * @swagger
     * /sports:
     *   post:
     *     summary: Create a new sport (Admin only)
     *     tags: [Sports]
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
     *             properties:
     *               name:
     *                 type: string
     *     responses:
     *       201:
     *         description: Sport created successfully
     */
    .post(protect, authorize('admin'), createSport);

/**
 * @swagger
 * /sports/{id}:
 *   get:
 *     summary: Get sport by ID
 *     tags: [Sports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sport ID
 *     responses:
 *       200:
 *         description: Sport details
 *       404:
 *         description: Sport not found
 *   put:
 *     summary: Update sport (Admin only)
 *     tags: [Sports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sport ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sport updated successfully
 *   delete:
 *     summary: Delete sport (Admin only)
 *     tags: [Sports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sport ID
 *     responses:
 *       200:
 *         description: Sport deleted successfully
 */
router.route('/:id')
    .get(getSport)
    .put(protect, authorize('admin'), updateSport)
    .delete(protect, authorize('admin'), deleteSport);

module.exports = router;
