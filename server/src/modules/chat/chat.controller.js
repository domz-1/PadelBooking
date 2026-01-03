const chatService = require('./chat.service');

exports.sendMessage = async (req, res, next) => {
    try {
        const { receiverId, message } = req.body;
        const chat = await chatService.sendMessage({
            senderId: req.user.id,
            receiverId,
            message
        });

        // Emit socket event (handled in server.js or socket config)
        req.app.get('io').to(req.user.id.toString()).to(receiverId.toString()).emit('message', chat);

        res.status(201).json({ success: true, data: chat });
    } catch (error) {
        next(error);
    }
};

exports.getMessages = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const messages = await chatService.getMessages(req.user.id, userId);
        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        next(error);
    }
};
