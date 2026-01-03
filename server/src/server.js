const app = require('./app');
const { connectDB } = require('./config/database');
const http = require('http');
const socketio = require('socket.io');

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

const PORT = process.env.PORT || 4000;

const startServer = async () => {
    await connectDB();

    server.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
};

startServer();
