const app = require('./app');
const { connectDB } = require('./config/database');
const http = require('http');
const socketio = require('socket.io');
const cron = require('node-cron');
const bookingService = require('./common/services/booking.service');
const telegramBotService = require('./common/services/telegram-bot.service');

const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Make io accessible in routes
app.set('io', io);

// Socket.io logic
io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    socket.on('join', (userId) => {
        if (userId) {
            socket.join(userId.toString());
            console.log(`User ${userId} joined their room`);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Schedule daily availability update at 9:00 AM
cron.schedule('0 9 * * *', () => {
    console.log('Running daily availability broadcast...');
    bookingService.broadcastDailyAvailability();
});

const PORT = process.env.PORT || 4000;

const startServer = async () => {
    await connectDB();
    telegramBotService.init();

    server.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
};

startServer();
