const settingsService = require('./settings.service');

// Config
exports.getConfig = async (req, res, next) => {
    try {
        const config = await settingsService.getConfig();
        res.status(200).json({ success: true, data: config });
    } catch (error) {
        next(error);
    }
};

exports.updateConfig = async (req, res, next) => {
    try {
        const config = await settingsService.updateConfig(req.body);
        res.status(200).json({ success: true, data: config, message: req.t('success') });
    } catch (error) {
        next(error);
    }
};

// Categories
exports.getCategories = async (req, res, next) => {
    try {
        const categories = await settingsService.getAllCategories();
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        next(error);
    }
};

exports.createCategory = async (req, res, next) => {
    try {
        const category = await settingsService.createCategory(req.body);
        res.status(201).json({ success: true, data: category, message: req.t('success') });
    } catch (error) {
        next(error);
    }
};

exports.updateCategory = async (req, res, next) => {
    try {
        const category = await settingsService.updateCategory(req.params.id, req.body);
        if (!category) {
            return res.status(404).json({ success: false, message: req.t('notFound') });
        }
        res.status(200).json({ success: true, data: category, message: req.t('success') });
    } catch (error) {
        next(error);
    }
};

exports.deleteCategory = async (req, res, next) => {
    try {
        const category = await settingsService.deleteCategory(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: req.t('notFound') });
        }
        res.status(200).json({ success: true, data: {}, message: req.t('success') });
    } catch (error) {
        next(error);
    }
};

// Booking Statuses
exports.getBookingStatuses = async (req, res, next) => {
    try {
        const statuses = await settingsService.getAllBookingStatuses();
        res.status(200).json({ success: true, data: statuses });
    } catch (error) {
        next(error);
    }
};

exports.createBookingStatus = async (req, res, next) => {
    try {
        const status = await settingsService.createBookingStatus(req.body);
        res.status(201).json({ success: true, data: status, message: req.t('success') });
    } catch (error) {
        next(error);
    }
};

exports.updateBookingStatus = async (req, res, next) => {
    try {
        const status = await settingsService.updateBookingStatus(req.params.id, req.body);
        if (!status) {
            return res.status(404).json({ success: false, message: req.t('notFound') });
        }
        res.status(200).json({ success: true, data: status, message: req.t('success') });
    } catch (error) {
        next(error);
    }
};

exports.deleteBookingStatus = async (req, res, next) => {
    try {
        const status = await settingsService.deleteBookingStatus(req.params.id);
        if (!status) {
            return res.status(404).json({ success: false, message: req.t('notFound') });
        }
        res.status(200).json({ success: true, data: {}, message: req.t('success') });
    } catch (error) {
        next(error);
    }
};

exports.getAnalysis = async (req, res, next) => {
    try {
        const analysis = await settingsService.getAnalysis();
        res.status(200).json({ success: true, data: analysis });
    } catch (error) {
        next(error);
    }
};
