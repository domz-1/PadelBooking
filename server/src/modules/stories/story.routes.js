const express = require('express');
const { getStories, createStory } = require('./story.controller');
const { protect } = require('../../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Stories
 *   description: Story management
 */

/**
 * @swagger
 * /stories:
 *   get:
 *     summary: Get all stories
 *     tags: [Stories]
 *     responses:
 *       200:
 *         description: List of stories
 *   post:
 *     summary: Create a story
 *     tags: [Stories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - media
 *             properties:
 *               media:
 *                 type: string
 *                 format: binary
 *               caption:
 *                 type: string
 *     responses:
 *       201:
 *         description: Story created
 */
router.route('/')
    .get(getStories)
    .post(protect, createStory);

module.exports = router;
