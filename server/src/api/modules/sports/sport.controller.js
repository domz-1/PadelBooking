const sportService = require('../../../common/services/sport.service');

exports.getSports = async (req, res, next) => {
    try {
        const sports = await sportService.getAllSports();
        res.status(200).json({ success: true, data: sports, message: req.t('success') });
    } catch (error) {
        next(error);
    }
};

exports.getSport = async (req, res, next) => {
    try {
        const sport = await sportService.getSportById(req.params.id);
        if (!sport) {
            return res.status(404).json({ success: false, message: req.t('notFound') });
        }
        res.status(200).json({ success: true, data: sport });
    } catch (error) {
        next(error);
    }
};

exports.createSport = async (req, res, next) => {
    try {
        const sport = await sportService.createSport(req.body);
        res.status(201).json({ success: true, data: sport, message: req.t('success') });
    } catch (error) {
        next(error);
    }
};

exports.updateSport = async (req, res, next) => {
    try {
        const sport = await sportService.updateSport(req.params.id, req.body);
        if (!sport) {
            return res.status(404).json({ success: false, message: req.t('notFound') });
        }
        res.status(200).json({ success: true, data: sport, message: req.t('success') });
    } catch (error) {
        next(error);
    }
};

exports.deleteSport = async (req, res, next) => {
    try {
        const sport = await sportService.deleteSport(req.params.id);
        if (!sport) {
            return res.status(404).json({ success: false, message: req.t('notFound') });
        }
        res.status(200).json({ success: true, data: {}, message: req.t('success') });
    } catch (error) {
        next(error);
    }
};
