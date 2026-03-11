"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisAdapter = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const serializer_1 = require("../core/serializer");
class RedisAdapter {
    constructor(url, retryAttempts = 3, retryDelay = 1000) {
        this.retryAttempts = retryAttempts;
        this.retryDelay = retryDelay;
        this.tagPrefix = 'cache_tag:';
        this.isConnected = false;
        this.serializer = new serializer_1.Serializer();
        this.redis = this.createClient(url);
        this.setupEventHandlers();
    }
    createClient(url) {
        return new ioredis_1.default(url, {
            maxRetriesPerRequest: this.retryAttempts,
            retryStrategy: (times) => {
                if (times > this.retryAttempts) {
                    return null;
                }
                return Math.min(times * this.retryDelay, 5000);
            },
            lazyConnect: true,
        });
    }
    setupEventHandlers() {
        this.redis.on('connect', () => {
            this.isConnected = true;
        });
        this.redis.on('error', (err) => {
            this.isConnected = false;
        });
        this.redis.on('close', () => {
            this.isConnected = false;
        });
    }
    async connect() {
        if (!this.isConnected) {
            await this.redis.connect().catch(() => { });
        }
    }
    async safeExecute(operation) {
        try {
            if (!this.isConnected) {
                await this.connect();
            }
            return await operation();
        }
        catch {
            return null;
        }
    }
    async get(key) {
        return this.safeExecute(async () => {
            const value = await this.redis.get(key);
            return this.serializer.deserialize(value);
        });
    }
    async set(key, value, ttl) {
        await this.safeExecute(async () => {
            const serialized = this.serializer.serialize(value);
            if (ttl && ttl > 0) {
                await this.redis.set(key, serialized, 'EX', ttl);
            }
            else {
                await this.redis.set(key, serialized);
            }
        });
    }
    async del(key) {
        await this.safeExecute(async () => {
            await this.redis.del(key);
        });
    }
    async clear() {
        await this.safeExecute(async () => {
            const keys = await this.redis.keys('*');
            if (keys.length > 0) {
                await this.redis.del(...keys);
            }
        });
    }
    async exists(key) {
        const result = await this.safeExecute(async () => {
            const count = await this.redis.exists(key);
            return count === 1;
        });
        return result ?? false;
    }
    async getKeys(pattern) {
        const result = await this.safeExecute(async () => {
            return await this.redis.keys(pattern);
        });
        return result ?? [];
    }
    async invalidateTag(tag) {
        await this.safeExecute(async () => {
            const tagKey = `${this.tagPrefix}${tag}`;
            const keys = await this.redis.smembers(tagKey);
            if (keys.length > 0) {
                await this.redis.del(...keys);
            }
            await this.redis.del(tagKey);
        });
    }
    async addToTag(tag, key) {
        await this.safeExecute(async () => {
            const tagKey = `${this.tagPrefix}${tag}`;
            await this.redis.sadd(tagKey, key);
        });
    }
    async getKeysByTag(tag) {
        const result = await this.safeExecute(async () => {
            const tagKey = `${this.tagPrefix}${tag}`;
            return await this.redis.smembers(tagKey);
        });
        return result ?? [];
    }
    async disconnect() {
        await this.redis.quit();
        this.isConnected = false;
    }
    getClient() {
        return this.redis;
    }
}
exports.RedisAdapter = RedisAdapter;
//# sourceMappingURL=redis.adapter.js.map