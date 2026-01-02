const express = require('express');
const { createSport, updateSport, deleteSport, getSports, getSport } = require('./sport.controller');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

/**
 * @swagger
 * tags:
 *   name: Sports (Admin)
 */

/**
 * @swagger
 * /admin/sports:
 *   get:
 *     summary: Get all sports
 *     tags: [Sports (Admin)]
 *     responses:
 *       200:
 *         description: List of sports
 *   post:
 *     summary: Create a new sport
 *     tags: [Sports (Admin)]
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
 *         description: Sport created
 */
router.route('/')
    .get(getSports)
    .post(createSport);

/**
 * @swagger
 * /admin/sports/{id}:
 *   get:
 *     summary: Get sport by ID
 *     tags: [Sports (Admin)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Sport details
 *   put:
 *     summary: Update sport
 *     tags: [Sports (Admin)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
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
 *         description: Sport updated
 *   delete:
 *     summary: Delete sport
 *     tags: [Sports (Admin)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Sport deleted
 */
router.route('/:id')
    .get(getSport)
    .put(updateSport)
    .delete(deleteSport);

module.exports = router;
