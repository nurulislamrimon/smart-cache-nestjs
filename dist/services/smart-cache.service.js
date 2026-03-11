"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartCache = void 0;
const common_1 = require("@nestjs/common");
const redis_adapter_1 = require("../adapters/redis.adapter");
const memory_adapter_1 = require("../adapters/memory.adapter");
const key_builder_1 = require("../core/key-builder");
const serializer_1 = require("../core/serializer");
const stampede_1 = require("../core/stampede");
let SmartCache = class SmartCache {
    constructor(options = {}) {
        this.hits = 0;
        this.misses = 0;
        const { url = 'redis://localhost:6379', prefix = 'app', ttl = 60, memory = true, memoryTTL = 5, memorySize = 500, } = options;
        this.defaultTTL = ttl;
        this.redis = new redis_adapter_1.RedisAdapter(url);
        this.memory = memory ? new memory_adapter_1.MemoryAdapter(memorySize, memoryTTL) : undefined;
        this.keyBuilder = new key_builder_1.KeyBuilder(prefix);
        this.stampede = new stampede_1.StampedeProtection(10);
        this.serializer = new serializer_1.Serializer();
    }
    async getRedis(key) {
        const value = await this.redis.get(key);
        if (value !== null) {
            this.hits++;
            if (this.memory) {
                await this.memory.set(key, value, this.defaultTTL);
            }
            return value;
        }
        this.misses++;
        return null;
    }
    async getMemory(key) {
        if (!this.memory)
            return null;
        const value = await this.memory.get(key);
        if (value !== null) {
            this.hits++;
            return value;
        }
        return null;
    }
    async get(key) {
        const memoryValue = await this.getMemory(key);
        if (memoryValue !== null)
            return memoryValue;
        return this.getRedis(key);
    }
    async set(key, value, ttl = this.defaultTTL) {
        if (this.memory) {
            await this.memory.set(key, value, ttl);
        }
        await this.redis.set(key, value, ttl);
    }
    async del(key) {
        if (this.memory)
            await this.memory.del(key);
        await this.redis.del(key);
    }
    async clear() {
        if (this.memory)
            await this.memory.clear();
        await this.redis.clear();
        this.hits = 0;
        this.misses = 0;
    }
    async invalidate(tag) {
        if (this.memory)
            await this.memory.invalidateTag(tag);
        await this.redis.invalidateTag(tag);
    }
    async has(key) {
        if (this.memory && await this.memory.exists(key))
            return true;
        return this.redis.exists(key);
    }
    async remember(key, fn, ttl = this.defaultTTL) {
        const cacheKey = this.key(key);
        const cached = await this.get(cacheKey);
        if (cached !== null)
            return cached;
        const result = await this.stampede.execute(cacheKey, async () => {
            const existing = await this.get(cacheKey);
            if (existing !== null)
                return existing;
            return fn();
        });
        await this.set(cacheKey, result, ttl);
        return result;
    }
    key(...args) {
        return this.keyBuilder.build(...args);
    }
    stats() {
        const total = this.hits + this.misses;
        return {
            hits: this.hits,
            misses: this.misses,
            hitRate: total > 0 ? this.hits / total : 0,
        };
    }
    async onModuleDestroy() {
        if (this.memory)
            await this.memory.clear();
        if ('disconnect' in this.redis) {
            await this.redis.disconnect();
        }
    }
};
exports.SmartCache = SmartCache;
exports.SmartCache = SmartCache = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object])
], SmartCache);
//# sourceMappingURL=smart-cache.service.js.map