const matchService = require('./match.service');

exports.createMatch = async (req, res, next) => {
    try {
        const match = await matchService.createMatch(req.user.id, req.body);
        res.status(201).json({ success: true, data: match, message: req.t('success') });
    } catch (error) {
        next(error);
    }
};

exports.getOpenMatches = async (req, res, next) => {
    try {
        const matches = await matchService.getOpenMatches();
        res.status(200).json({ success: true, data: matches });
    } catch (error) {
        next(error);
    }
};

exports.getAllMatches = async (req, res, next) => {
    try {
        const matches = await matchService.getAllMatches();
        res.status(200).json({ success: true, data: matches });
    } catch (error) {
        next(error);
    }
};

exports.joinMatch = async (req, res, next) => {
    try {
        const request = await matchService.requestJoin(req.params.id, req.user.id);
        res.status(201).json({ success: true, data: request, message: req.t('success') });
    } catch (error) {
        next(error);
    }
};

exports.handleRequest = async (req, res, next) => {
    try {
        const { status } = req.body; // accepted or declined
        const request = await matchService.handleRequest(req.params.requestId, status, req.user.id);
        res.status(200).json({ success: true, data: request, message: req.t('success') });
    } catch (error) {
        next(error);
    }
};

exports.deleteMatch = async (req, res, next) => {
    try {
        const match = await matchService.deleteMatch(req.params.id);
        if (!match) {
            return res.status(404).json({ success: false, message: req.t('notFound') });
        }
        res.status(200).json({ success: true, data: {}, message: req.t('success') });
    } catch (error) {
        next(error);
    }
};
