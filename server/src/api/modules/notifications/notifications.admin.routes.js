const express = require('express');
const { sendBroadcast } = require('./notification.controller');
const { protect, authorize } = require('../../../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));


router.post('/broadcast', sendBroadcast);

module.exports = router;
