const metricsService = require('./metrics.service');

exports.getStats = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const stats = await metricsService.getDashboardStats(startDate, endDate);
        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        next(error);
    }
};

exports.getAvailableSlots = async (req, res, next) => {
    try {
        const { date, startTime, endTime, branchId } = req.query;
        if (!date) {
            return res.status(400).json({ success: false, message: 'Date is required' });
        }
        const slots = await metricsService.getAvailableSlots(date, startTime, endTime, branchId);
        res.status(200).json({ success: true, data: slots });
    } catch (error) {
        next(error);
    }
};
