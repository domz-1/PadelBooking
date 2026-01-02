const offerService = require('./offer.service');

exports.getOffers = async (req, res, next) => {
    try {
        // If admin, allowing viewing all with pagination. If client, active only.
        // Or simply expose different methods. 
        // User requested "functions for admin", so typically list all.
        // We will keep getOffers for Client (Active) and add getAllOffers for Admin.
        const offers = await offerService.getActiveOffers();
        res.status(200).json({ success: true, data: offers });
    } catch (error) {
        next(error);
    }
};

exports.getAllOffers = async (req, res, next) => {
    try {
        const { count, rows, page, limit } = await offerService.getAllOffers(req.query);
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

exports.createOffer = async (req, res, next) => {
    try {
        const offer = await offerService.createOffer(req.body);
        res.status(201).json({ success: true, data: offer, message: req.t('success') });
    } catch (error) {
        next(error);
    }
};

exports.deleteOffer = async (req, res, next) => {
    try {
        const offer = await offerService.deleteOffer(req.params.id);
        if (!offer) {
            return res.status(404).json({ success: false, message: req.t('notFound') });
        }
        res.status(200).json({ success: true, data: {}, message: req.t('success') });
    } catch (error) {
        next(error);
    }
};
