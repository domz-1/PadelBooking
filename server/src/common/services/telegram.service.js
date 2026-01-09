const axios = require('axios');
const templates = require('./telegram-templates');
const TelegramSubscriber = require('../../api/modules/notifications/telegramSubscriber.model');

class TelegramService {
    constructor() {
        this.botToken = process.env.TELEGRAM_BOT_TOKEN;
        this.chatId = process.env.TELEGRAM_CHAT_ID; // General/Admin chat ID
    }

    async sendToAdmin(templateName, data) {
        if (!this.botToken || !this.chatId) return;
        const message = this.formatMessage(templateName, data);
        return this.sendMessage(this.chatId, message);
    }

    async sendToAllSubscribers(templateName, data) {
        if (!this.botToken) return;

        const subscribers = await TelegramSubscriber.findAll({ where: { isActive: true } });
        const message = this.formatMessage(templateName, data);

        const promises = subscribers.map(sub => this.sendMessage(sub.chatId, message));
        return Promise.allSettled(promises);
    }

    formatMessage(templateName, data) {
        let template = templates[templateName] || templateName;
        Object.keys(data).forEach(key => {
            const placeholder = `{${key}}`;
            template = template.replace(new RegExp(placeholder, 'g'), data[key]);
        });
        return template;
    }

    async sendMessage(chatId, text) {
        try {
            const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
            await axios.post(url, {
                chat_id: chatId,
                text: text,
                parse_mode: 'Markdown'
            });
        } catch (error) {
            console.error(`Telegram sendMessage failed for ${chatId}:`, error.message);
        }
    }

    async subscribe(chatId, language = 'en') {
        const [subscriber, created] = await TelegramSubscriber.findOrCreate({
            where: { chatId },
            defaults: { language }
        });
        if (!created && !subscriber.isActive) {
            await subscriber.update({ isActive: true });
        }
        return subscriber;
    }

    async unsubscribe(chatId) {
        return await TelegramSubscriber.update(
            { isActive: false },
            { where: { chatId } }
        );
    }
}

module.exports = new TelegramService();
