const notificationService = require('./notification.service');

exports.getMyNotifications = async (req, res, next) => {
    try {
        const notifications = await notificationService.getUserNotifications(req.user.id);
        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        next(error);
    }
};

exports.markAsRead = async (req, res, next) => {
    try {
        const notification = await notificationService.markAsRead(req.params.id, req.user.id);
        if (!notification) {
            return res.status(404).json({ success: false, message: req.t('notFound') });
        }
        res.status(200).json({ success: true, data: notification, message: req.t('success') });
    } catch (error) {
        next(error);
    }
};

exports.sendBroadcast = async (req, res, next) => {
    try {
        const result = await notificationService.sendBroadcast(req.body, req.io);
        res.status(200).json({ success: true, data: result, message: req.t('success') });
    } catch (error) {
        next(error);
    }
};
