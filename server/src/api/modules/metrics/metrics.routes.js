const express = require('express');
const { getStats, getAvailableSlots } = require('./metrics.controller');
const { protect, authorize } = require('../../../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'super-admin'));


router.get('/stats', getStats);

router.get('/available-slots', getAvailableSlots);

module.exports = router;
