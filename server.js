require('./config/dotenv'); // Load environment variables first
const app = require('./app');
const connectDB = require('./config/db');
const config = require('./config/dotenv');

// Connect to database
connectDB();

const findAvailablePort = async (startPort) => {
    const net = require('net');
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.unref();
        server.on('error', () => {
            resolve(findAvailablePort(startPort + 1));
        });
        server.listen(startPort, () => {
            server.close(() => {
                resolve(startPort);
            });
        });
    });
};

const startServer = async () => {
    try {
        const availablePort = await findAvailablePort(config.PORT);
        const server = app.listen(availablePort, () => {
            console.log(`Server running in ${config.NODE_ENV} mode on port ${availablePort}`);
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (err) => {
            console.log(`Error: ${err.message}`);
            server.close(() => process.exit(1));
        });

        // Handle SIGTERM signal
        process.on('SIGTERM', () => {
            console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
            server.close(() => {
                console.log('💥 Process terminated!');
            });
        });

    } catch (error) {
        console.error('Server failed to start:', error);
        process.exit(1);
    }
};

startServer();