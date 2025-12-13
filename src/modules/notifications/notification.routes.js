const express = require('express');
const { getMyNotifications, markAsRead, sendBroadcast } = require('./notification.controller');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

router.get('/', protect, getMyNotifications);
router.put('/:id/read', protect, markAsRead);
router.post('/broadcast', protect, authorize('admin'), sendBroadcast);

module.exports = router;
