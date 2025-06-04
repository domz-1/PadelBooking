const app = require('./app');
const connectDB = require('./config/db');
const config = require('./config/dotenv');

connectDB();


const startServer = async () => {
    try {
        const server = app.listen(config.PORT, () => {
            console.log(`Server running in ${config.NODE_ENV} mode on port ${config.PORT}`);
        });

        process.on('unhandledRejection', (err) => {
            console.log(`Error: ${err.message}`);
            server.close(() => process.exit(1));
        });

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