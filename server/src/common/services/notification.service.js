const Notification = require('../../api/modules/notifications/notification.model');
const User = require('../../api/modules/users/user.model');

class NotificationService {
    async createNotification(userId, data) {
        return await Notification.create({ ...data, userId });
    }

    async getUserNotifications(userId) {
        return await Notification.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });
    }

    async markAsRead(id, userId) {
        const notification = await Notification.findOne({ where: { id, userId } });
        if (!notification) return null;
        return await notification.update({ isRead: true });
    }

    async sendBroadcast(data, io) {
        // Create notification for all users (this might be heavy for large user base, consider optimization later)
        const users = await User.findAll({ attributes: ['id'] });
        const notifications = users.map(user => ({
            userId: user.id,
            title: data.title,
            message: data.message,
            type: 'broadcast'
        }));

        await Notification.bulkCreate(notifications);

        // Emit to all connected clients
        if (io) {
            io.emit('broadcast', data);
        }

        return { count: users.length };
    }
}

module.exports = new NotificationService();
