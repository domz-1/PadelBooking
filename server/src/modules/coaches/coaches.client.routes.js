const express = require('express');
const { getCoaches, createProfile, createPackage } = require('./coach.controller');
const { protect, authorize } = require('../../middleware/auth');
const { upload, convertImage } = require('../../middleware/upload');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Coaches
 *   description: Coach management
 */

/**
 * @swagger
 * /coaches:
 *   get:
 *     summary: Get all coaches
 *     tags: [Coaches]
 *     responses:
 *       200:
 *         description: List of coaches
 */
router.get('/', getCoaches);

/**
 * @swagger
 * /coaches/profile:
 *   post:
 *     summary: Create coach profile
 *     tags: [Coaches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bio
 *               - experience
 *             properties:
 *               bio:
 *                 type: string
 *               experience:
 *                 type: string
 *     responses:
 *       201:
 *         description: Coach profile created
 */
router.post('/profile', protect, upload.single('image'), convertImage, createProfile); // User becomes coach

/**
 * @swagger
 * /coaches/packages:
 *   post:
 *     summary: Create coach package
 *     tags: [Coaches]
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
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Package created
 */
router.post('/packages', protect, createPackage); // Coach adds package

module.exports = router;
