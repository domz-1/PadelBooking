const Venue = require('../models/Venue');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/errorHandler').ErrorResponse;

exports.createVenue = catchAsync(async (req, res) => {
    const venue = await Venue.create(req.body);
    res.status(201).json({
        status: 'success',
        data: venue,
    });
});

exports.getVenues = catchAsync(async (req, res) => {
    const venues = await Venue.find({ isActive: true });
    res.status(200).json({
        status: 'success',
        resultsNumber: venues.length,
        data: venues,
    });
});

exports.getVenue = catchAsync(async (req, res) => {
    const venue = await Venue.findById(req.params.id);
    if (!venue) {
        return res.status(404).json({
            status: 'fail',
            message: 'Venue not found',
        });
    }
    res.status(200).json({
        status: 'success',
        data: venue,
    });
});

exports.updateVenue = catchAsync(async (req, res) => {
    const venue = await Venue.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        status: 'success',
        data: venue,
    });
});

exports.deleteVenue = catchAsync(async (req, res) => {
    await Venue.findByIdAndDelete(req.params.id);

    res.status(204).json({
        status: 'success',
        data: null,
    });
});
