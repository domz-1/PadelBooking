const Chat = require('./chat.model');
const User = require('../users/user.model');
const { Op } = require('sequelize');

class ChatService {
    async sendMessage(data) {
        return await Chat.create(data);
    }

    async getMessages(userId1, userId2) {
        return await Chat.findAll({
            where: {
                [Op.or]: [
                    { senderId: userId1, receiverId: userId2 },
                    { senderId: userId2, receiverId: userId1 }
                ]
            },
            order: [['createdAt', 'ASC']],
            include: [
                { model: User, as: 'Sender', attributes: ['name'] },
                { model: User, as: 'Receiver', attributes: ['name'] }
            ]
        });
    }
}

module.exports = new ChatService();
