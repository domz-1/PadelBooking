const express = require('express');
const { updateProfile, updatePassword, findPartners, getProfile } = require('./user.controller');
const { protect } = require('../../middleware/auth');
const { upload, convertImage } = require('../../middleware/upload');
const router = express.Router();

// Apply protection to all client routes
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Users (Client)
 *   description: User profile and interaction
 */

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update own profile
 *     tags: [Users (Client)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/profile', upload.single('image'), convertImage, updateProfile);

/**
 * @swagger
 * /api/users/password:
 *   put:
 *     summary: Update password
 *     tags: [Users (Client)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 */
router.put('/password', updatePassword);

/**
 * @swagger
 * /api/users/partners:
 *   get:
 *     summary: Find partners
 *     tags: [Users (Client)]
 *     parameters:
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *         description: Skill level to filter by
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         description: Region to filter by
 *     responses:
 *       200:
 *         description: List of potential partners
 */
router.get('/partners', findPartners);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user public profile
 *     tags: [Users (Client)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 *       403:
 *         description: Profile is private
 */
router.get('/:id', getProfile);

module.exports = router;
