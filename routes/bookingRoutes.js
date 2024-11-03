const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.use(protect); // All booking routes require authentication

router
  .route('/')
  .get(bookingController.getBookings)
  .post(bookingController.createBooking);

router
  .route('/:id/cancel')
  .patch(bookingController.cancelBooking);

module.exports = router; 