const { Telegraf } = require('telegraf');
const telegramService = require('./telegram.service');
const bookingService = require('./booking.service');

class TelegramBotService {
    constructor() {
        this.bot = null;
    }

    init() {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        if (!token) {
            console.warn('TELEGRAM_BOT_TOKEN not provided. Bot will not start.');
            return;
        }

        this.bot = new Telegraf(token);

        this.bot.command('start', (ctx) => {
            ctx.reply('Welcome to Padel Booking Bot! 🎾\n\nUse /subscribe to get daily availability and booking updates.\nUse /unsubscribe to stop receiving notifications.\nUse /today to see current free slots.');
        });

        this.bot.command('subscribe', async (ctx) => {
            const chatId = ctx.chat.id.toString();
            try {
                await telegramService.subscribe(chatId);
                ctx.reply('✅ You are now subscribed to Padel Booking notifications!');
            } catch (error) {
                console.error('Subscribe error:', error);
                ctx.reply('❌ Failed to subscribe. Please try again later.');
            }
        });

        this.bot.command('unsubscribe', async (ctx) => {
            const chatId = ctx.chat.id.toString();
            try {
                await telegramService.unsubscribe(chatId);
                ctx.reply('🔕 You have been unsubscribed from Padel Booking notifications.');
            } catch (error) {
                console.error('Unsubscribe error:', error);
                ctx.reply('❌ Failed to unsubscribe. Please try again later.');
            }
        });

        this.bot.command('today', async (ctx) => {
            const chatId = ctx.chat.id.toString();
            try {
                ctx.reply('Fetching today\'s availability...');
                await bookingService.broadcastDailyAvailability(chatId);
            } catch (error) {
                console.error('Today command error:', error);
                ctx.reply('❌ Failed to fetch availability.');
            }
        });

        this.bot.launch().then(() => {
            console.log('Telegram bot started successfully');
        }).catch(err => {
            console.error('Failed to launch Telegram bot:', err);
        });

        // Enable graceful stop
        process.once('SIGINT', () => { if (this.bot) this.bot.stop('SIGINT'); });
        process.once('SIGTERM', () => { if (this.bot) this.bot.stop('SIGTERM'); });
    }
}

module.exports = new TelegramBotService();
