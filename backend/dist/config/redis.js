import { Redis } from 'ioredis';
import { config } from './index.js';
let isRedisConnected = false;
const memoryStore = new Map();
export const redisClient = new Redis(config.redis.url, {
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 0,
    retryStrategy: () => null,
    autoResubscribe: false,
    autoResendUnfulfilledCommands: false,
});
redisClient.on('error', (err) => {
    // Silence connection errors when running in fallback mode
    isRedisConnected = false;
});
redisClient.on('connect', () => {
    console.log('Connected to Redis server');
    isRedisConnected = true;
});
// Attempt silent connection
redisClient.connect().catch((err) => {
    isRedisConnected = false;
});
export const getCache = async (key) => {
    if (isRedisConnected) {
        try {
            return await redisClient.get(key);
        }
        catch {
            isRedisConnected = false;
        }
    }
    const item = memoryStore.get(key);
    if (!item)
        return null;
    if (item.expiry && Date.now() > item.expiry) {
        memoryStore.delete(key);
        return null;
    }
    return item.value;
};
export const setCache = async (key, value, ttl) => {
    if (isRedisConnected) {
        try {
            if (ttl) {
                await redisClient.set(key, value, 'EX', ttl);
            }
            else {
                await redisClient.set(key, value);
            }
            return;
        }
        catch {
            isRedisConnected = false;
        }
    }
    const expiry = ttl ? Date.now() + ttl * 1000 : undefined;
    memoryStore.set(key, { value, expiry });
};
export const delCache = async (key) => {
    if (isRedisConnected) {
        try {
            await redisClient.del(key);
            return;
        }
        catch {
            isRedisConnected = false;
        }
    }
    memoryStore.delete(key);
};
