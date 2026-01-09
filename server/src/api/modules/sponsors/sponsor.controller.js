const Sponsor = require('./sponsor.model');
const ErrorResponse = require('../../../common/utils/errorResponse');

// @desc    Get all sponsors
// @route   GET /api/v1/sponsors
// @access  Public
exports.getSponsors = async (req, res, next) => {
    try {
        const sponsors = await Sponsor.findAll({
            where: { isActive: true },
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            count: sponsors.length,
            data: sponsors
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single sponsor
// @route   GET /api/v1/sponsors/:id
// @access  Public
exports.getSponsor = async (req, res, next) => {
    try {
        const sponsor = await Sponsor.findByPk(req.params.id);

        if (!sponsor) {
            return next(new ErrorResponse(`Sponsor not found with id of ${req.params.id}`, 404));
        }

        res.status(200).json({
            success: true,
            data: sponsor
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new sponsor
// @route   POST /api/v1/sponsors
// @access  Private (Admin)
exports.createSponsor = async (req, res, next) => {
    try {
        // Add image path to body
        if (req.file) {
            req.body.image = req.file.path;
        }

        if (!req.body.image && !req.file) {
            return next(new ErrorResponse(`Please upload an image`, 400));
        }

        if (req.body.showInHome !== undefined) {
            req.body.showInHome = req.body.showInHome === 'true';
        }

        const sponsor = await Sponsor.create(req.body);

        res.status(201).json({
            success: true,
            data: sponsor
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update sponsor
// @route   PUT /api/v1/sponsors/:id
// @access  Private (Admin)
exports.updateSponsor = async (req, res, next) => {
    try {
        let sponsor = await Sponsor.findByPk(req.params.id);

        if (!sponsor) {
            return next(new ErrorResponse(`Sponsor not found with id of ${req.params.id}`, 404));
        }

        if (req.file) {
            req.body.image = req.file.path;
        }

        if (req.body.showInHome !== undefined) {
            req.body.showInHome = req.body.showInHome === 'true';
        }

        sponsor = await sponsor.update(req.body);

        res.status(200).json({
            success: true,
            data: sponsor
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete sponsor
// @route   DELETE /api/v1/sponsors/:id
// @access  Private (Admin)
exports.deleteSponsor = async (req, res, next) => {
    try {
        const sponsor = await Sponsor.findByPk(req.params.id);

        if (!sponsor) {
            return next(new ErrorResponse(`Sponsor not found with id of ${req.params.id}`, 404));
        }

        await sponsor.destroy();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};
