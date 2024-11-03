const express = require('express');
const router = express.Router();
const venueController = require('../controllers/venueController');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(venueController.getVenues)
  .post(protect, authorize('admin', 'manager'), venueController.createVenue);

router
  .route('/:id')
  .get(venueController.getVenue)
  .patch(protect, authorize('admin', 'manager'), venueController.updateVenue)
  .delete(protect, authorize('admin'), venueController.deleteVenue);

module.exports = router; 