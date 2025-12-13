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
