const Waitlist = require('./waitlist.model');
const Venue = require('../venues/venue.model');

exports.joinWaitlist = async (req, res, next) => {
    try {
        const { venueId, date, startTime, endTime } = req.body;

        // Check if venue exists
        const venue = await Venue.findByPk(venueId);
        if (!venue) {
            return res.status(404).json({ success: false, message: req.t('notFound') });
        }

        const waitlistEntry = await Waitlist.create({
            userId: req.user.id,
            venueId,
            date,
            startTime,
            endTime
        });

        res.status(201).json({ success: true, data: waitlistEntry, message: req.t('success') });
    } catch (error) {
        next(error);
    }
};

exports.leaveWaitlist = async (req, res, next) => {
    try {
        const entry = await Waitlist.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!entry) {
            return res.status(404).json({ success: false, message: req.t('notFound') });
        }

        await entry.destroy();
        res.status(200).json({ success: true, data: {}, message: req.t('success') });
    } catch (error) {
        next(error);
    }
};

exports.getMyWaitlist = async (req, res, next) => {
    try {
        const entries = await Waitlist.findAll({
            where: { userId: req.user.id },
            include: [{ model: Venue, attributes: ['name'] }]
        });
        res.status(200).json({ success: true, data: entries });
    } catch (error) {
        next(error);
    }
};
