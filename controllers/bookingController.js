const Booking = require('../models/Booking');
const Venue = require('../models/Venue');
const catchAsync = require('../utils/catchAsync');
const dayjs = require('dayjs');
const AppError = require('../utils/errorHandler').ErrorResponse;

exports.createBooking = catchAsync(async (req, res) => {
  const { venueId, courtId, startTime, endTime, players } = req.body;

  // Check if venue exists
  const venue = await Venue.findById(venueId);
  if (!venue) {
    throw new AppError('Venue not found', 404);
  }

  // Calculate duration in minutes
  const duration = dayjs(endTime).diff(dayjs(startTime), 'minute');

  // Create booking
  const booking = await Booking.create({
    venueId,
    courtId,
    userId: req.user._id,
    startTime,
    endTime,
    duration,
    players,
    amount: {
      base: venue.courts.id(courtId).pricePerHour * (duration / 60),
      tax: 0, // Calculate tax if needed
      total: venue.courts.id(courtId).pricePerHour * (duration / 60)
    }
  });

  res.status(201).json({
    status: 'success',
    data: booking
  });
});

exports.getBookings = catchAsync(async (req, res) => {
  const bookings = await Booking.find({ userId: req.user._id })
    .populate('venueId', 'name location')
    .sort('-startTime');

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: bookings
  });
});

exports.cancelBooking = catchAsync(async (req, res) => {
  const booking = await Booking.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  // Check if cancellation is allowed (based on your business rules)
  const hoursUntilBooking = dayjs(booking.startTime).diff(dayjs(), 'hour');
  if (hoursUntilBooking < 24) {
    throw new AppError('Cancellation is only allowed 24 hours before the booking', 400);
  }

  booking.status = 'CANCELLED';
  booking.cancellationReason = req.body.reason;
  await booking.save();

  res.status(200).json({
    status: 'success',
    data: booking
  });
}); 