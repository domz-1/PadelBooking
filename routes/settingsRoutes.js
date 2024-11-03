const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/auth');
const dayjs = require('dayjs');

router
  .route('/')
  .get(settingsController.getSettings)
  .patch(protect, authorize('admin'), settingsController.updateSettings);

router
  .route('/maintenance')
  .patch(protect, authorize('admin'), settingsController.updateMaintenance);

module.exports = router; 