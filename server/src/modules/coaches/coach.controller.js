const coachService = require('./coach.service');

exports.getCoaches = async (req, res, next) => {
    try {
        const coaches = await coachService.getAllCoaches();
        res.status(200).json({ success: true, data: coaches });
    } catch (error) {
        next(error);
    }
};

exports.createProfile = async (req, res, next) => {
    try {
        if (req.file) {
            req.body.image = req.file.path;
        }
        const coach = await coachService.createCoachProfile(req.user.id, req.body);
        res.status(201).json({ success: true, data: coach, message: req.t('success') });
    } catch (error) {
        next(error);
    }
};

exports.createPackage = async (req, res, next) => {
    try {
        const coach = await coachService.getCoachByUserId(req.user.id);
        if (!coach) {
            return res.status(404).json({ success: false, message: 'Coach profile not found' });
        }
        const pkg = await coachService.createPackage(coach.id, req.body);
        res.status(201).json({ success: true, data: pkg, message: req.t('success') });
    } catch (error) {
        next(error);
    }
};

exports.deleteCoach = async (req, res, next) => {
    try {
        const coach = await coachService.deleteCoach(req.params.id);
        if (!coach) {
            return res.status(404).json({ success: false, message: req.t('notFound') });
        }
        res.status(200).json({ success: true, data: {}, message: req.t('success') });
    } catch (error) {
        next(error);
    }
};

exports.deletePackage = async (req, res, next) => {
    try {
        const pkg = await coachService.deletePackage(req.params.id);
        if (!pkg) {
            return res.status(404).json({ success: false, message: req.t('notFound') });
        }
        res.status(200).json({ success: true, data: {}, message: req.t('success') });
    } catch (error) {
        next(error);
    }
};

exports.updatePackage = async (req, res, next) => {
    try {
        const pkg = await coachService.updatePackage(req.params.id, req.body);
        if (!pkg) {
            return res.status(404).json({ success: false, message: req.t('notFound') });
        }
        res.status(200).json({ success: true, data: pkg, message: req.t('success') });
    } catch (error) {
        next(error);
    }
};

exports.adminCreatePackage = async (req, res, next) => {
    try {
        const { coachId, ...data } = req.body;
        if (!coachId) {
            return res.status(400).json({ success: false, message: 'coachId is required' });
        }
        const pkg = await coachService.createPackage(coachId, data);
        res.status(201).json({ success: true, data: pkg, message: req.t('success') });
    } catch (error) {
        next(error);
    }
};
