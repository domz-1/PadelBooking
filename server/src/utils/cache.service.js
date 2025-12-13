const { createClient } = require('redis');

class CacheService {
    constructor() {
        this.client = null;
        this.isConnected = false;
        if (process.env.USE_REDIS === 'true') {
            this.init();
        }
    }

    async init() {
        try {
            this.client = createClient({
                url: process.env.REDIS_URL || 'redis://redis:6379'
            });

            this.client.on('error', (err) => console.error('Redis Client Error', err));
            this.client.on('connect', () => {
                console.log('Redis Connected');
                this.isConnected = true;
            });

            await this.client.connect();
        } catch (error) {
            console.error('Failed to connect to Redis:', error);
        }
    }

    async get(key) {
        if (!this.isConnected) return null;
        try {
            const data = await this.client.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Redis Get Error:', error);
            return null;
        }
    }

    async set(key, value, expireSeconds = 3600) {
        if (!this.isConnected) return;
        try {
            await this.client.set(key, JSON.stringify(value), {
                EX: expireSeconds
            });
        } catch (error) {
            console.error('Redis Set Error:', error);
        }
    }

    async del(key) {
        if (!this.isConnected) return;
        try {
            await this.client.del(key);
        } catch (error) {
            console.error('Redis Del Error:', error);
        }
    }
}

module.exports = new CacheService();
