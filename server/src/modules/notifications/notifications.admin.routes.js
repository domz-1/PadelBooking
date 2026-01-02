const express = require('express');
const { sendBroadcast } = require('./notification.controller');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

/**
 * @swagger
 * tags:
 *   name: Notifications (Admin)
 */

/**
 * @swagger
 * /admin/notifications/broadcast:
 *   post:
 *     summary: Send broadcast notification
 *     tags: [Notifications (Admin)]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *             properties:
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Broadcast sent
 */
router.post('/broadcast', sendBroadcast);

module.exports = router;
