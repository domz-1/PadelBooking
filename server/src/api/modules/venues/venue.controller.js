const venueService = require('../../../common/services/venue.service');

exports.getVenues = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const { search, minPrice, maxPrice } = req.query;

        const { count, rows } = await venueService.getAllVenues({
            limit,
            offset,
            search,
            minPrice,
            maxPrice
        });

        res.status(200).json({
            success: true,
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            data: rows
        });
    } catch (error) {
        next(error);
    }
};

exports.getVenue = async (req, res, next) => {
    try {
        const venue = await venueService.getVenueById(req.params.id);
        if (!venue) {
            return res.status(404).json({ success: false, message: req.t('notFound') });
        }

        let responseData = venue.toJSON();

        // If outdoor, add weather
        if (venue.type === 'outdoor') {
            const weatherService = require('../../utils/weather.service');
            const GlobalConfig = require('../settings/globalConfig.model');
            const config = await GlobalConfig.findOne();
            const city = config ? config.city : 'Cairo';
            responseData.weather = await weatherService.getForecast(city);
        }

        res.status(200).json({ success: true, data: responseData });
    } catch (error) {
        next(error);
    }
};

exports.createVenue = async (req, res, next) => {
    try {
        if (req.files && req.files.length > 0) {
            req.body.images = req.files.map(file => file.path);
        }
        const venue = await venueService.createVenue(req.body);
        res.status(201).json({ success: true, data: venue });
    } catch (error) {
        next(error);
    }
};

exports.updateVenue = async (req, res, next) => {
    try {
        if (req.files && req.files.length > 0) {
            req.body.images = req.files.map(file => file.path);
        }
        const venue = await venueService.updateVenue(req.params.id, req.body);
        if (!venue) {
            return res.status(404).json({ success: false, message: 'Venue not found' });
        }
        res.status(200).json({ success: true, data: venue });
    } catch (error) {
        next(error);
    }
};

exports.deleteVenue = async (req, res, next) => {
    try {
        const venue = await venueService.deleteVenue(req.params.id);
        if (!venue) {
            return res.status(404).json({ success: false, message: 'Venue not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};
