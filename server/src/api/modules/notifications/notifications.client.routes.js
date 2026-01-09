const express = require('express');
const { getMyNotifications, markAsRead } = require('./notification.controller');
const { protect } = require('../../../middleware/auth');

const router = express.Router();

router.use(protect);


router.get('/', getMyNotifications);

router.put('/:id/read', markAsRead);

module.exports = router;
