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

        const fullEntry = await Waitlist.findByPk(waitlistEntry.id, {
            include: [
                { model: require('../users/user.model'), attributes: ['id', 'name', 'email', 'phone'] },
                { model: require('../venues/venue.model'), attributes: ['id', 'name'] }
            ]
        });

        // Notify all clients about waitlist change
        req.app.get('io').emit('waitlistUpdate', { type: 'join', data: fullEntry });

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

        // Notify all clients about waitlist change
        req.app.get('io').emit('waitlistUpdate', { type: 'leave', data: { id: Number(req.params.id), date: entry.date, venueId: entry.venueId } });

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

exports.getWaitlistForSlot = async (req, res, next) => {
    try {
        const { venueId, date, startTime, endTime } = req.query;

        const entries = await Waitlist.findAll({
            where: {
                venueId,
                date,
                startTime,
                endTime
            },
            include: [{
                model: require('../users/user.model'),
                attributes: ['id', 'name', 'email', 'phone']
            }]
        });

        res.status(200).json({ success: true, data: entries });
    } catch (error) {
        next(error);
    }
};

exports.adminJoinWaitlist = async (req, res, next) => {
    try {
        const { userId, venueId, date, startTime, endTime } = req.body;

        const waitlistEntry = await Waitlist.create({
            userId,
            venueId,
            date,
            startTime,
            endTime
        });

        const fullEntry = await Waitlist.findByPk(waitlistEntry.id, {
            include: [
                { model: require('../users/user.model'), attributes: ['id', 'name', 'email', 'phone'] },
                { model: require('../venues/venue.model'), attributes: ['id', 'name'] }
            ]
        });

        // Notify all clients about waitlist change
        req.app.get('io').emit('waitlistUpdate', { type: 'join', data: fullEntry });

        res.status(201).json({ success: true, data: waitlistEntry });
    } catch (error) {
        next(error);
    }
};

exports.adminDeleteWaitlist = async (req, res, next) => {
    try {
        const entry = await Waitlist.findByPk(req.params.id);

        if (!entry) {
            return res.status(404).json({ success: false, message: req.t('notFound') });
        }

        await entry.destroy();

        // Notify all clients about waitlist change
        req.app.get('io').emit('waitlistUpdate', { type: 'leave', data: { id: req.params.id, date: entry.date, venueId: entry.venueId } });

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};

exports.getDailyWaitlist = async (req, res, next) => {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ success: false, message: 'Date is required' });
        }

        const entries = await Waitlist.findAll({
            where: { date },
            include: [
                {
                    model: require('../users/user.model'),
                    attributes: ['id', 'name', 'email', 'phone']
                },
                {
                    model: require('../venues/venue.model'),
                    attributes: ['id', 'name']
                }
            ],
            order: [['createdAt', 'ASC']]
        });

        res.status(200).json({ success: true, data: entries });
    } catch (error) {
        next(error);
    }
};
