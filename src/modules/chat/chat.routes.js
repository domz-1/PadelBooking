const express = require('express');
const { sendMessage, getMessages } = require('./chat.controller');
const { protect } = require('../../middleware/auth');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Chat functionality
 */

/**
 * @swagger
 * /chat:
 *   post:
 *     summary: Send a message
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *               - message
 *             properties:
 *               receiverId:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent
 */
router.post('/', sendMessage);

/**
 * @swagger
 * /chat/{userId}:
 *   get:
 *     summary: Get messages with a user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of messages
 */
router.get('/:userId', getMessages);

module.exports = router;
