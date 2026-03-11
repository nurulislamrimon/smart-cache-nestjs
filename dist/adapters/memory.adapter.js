"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryAdapter = void 0;
const serializer_1 = require("../core/serializer");
class MemoryAdapter {
    constructor(maxSize = 1000, ttl = 300) {
        this.cache = new Map();
        this.accessOrder = [];
        this.tagIndex = new Map();
        this.serializer = new serializer_1.Serializer();
        this.maxSize = maxSize;
        this.ttl = ttl;
    }
    evictIfNeeded() {
        while (this.cache.size >= this.maxSize && this.accessOrder.length > 0) {
            const oldestKey = this.accessOrder.shift();
            if (oldestKey) {
                this.removeFromTagIndex(oldestKey);
                this.cache.delete(oldestKey);
            }
        }
    }
    removeFromTagIndex(key) {
        for (const [, keys] of this.tagIndex) {
            keys.delete(key);
        }
    }
    isExpired(entry) {
        return entry.expiry > 0 && Date.now() > entry.expiry;
    }
    updateAccess(key) {
        const index = this.accessOrder.indexOf(key);
        if (index > -1) {
            this.accessOrder.splice(index, 1);
        }
        this.accessOrder.push(key);
    }
    async get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return null;
        }
        if (this.isExpired(entry)) {
            this.del(key);
            return null;
        }
        this.updateAccess(key);
        return entry.value;
    }
    async set(key, value, ttl) {
        this.evictIfNeeded();
        const expiry = ttl && ttl > 0 ? Date.now() + ttl * 1000 : 0;
        this.cache.set(key, { value, expiry });
        this.updateAccess(key);
    }
    async del(key) {
        this.removeFromTagIndex(key);
        this.cache.delete(key);
        const index = this.accessOrder.indexOf(key);
        if (index > -1) {
            this.accessOrder.splice(index, 1);
        }
    }
    async clear() {
        this.cache.clear();
        this.accessOrder = [];
        this.tagIndex.clear();
    }
    async exists(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return false;
        }
        if (this.isExpired(entry)) {
            await this.del(key);
            return false;
        }
        return true;
    }
    async getKeys(pattern) {
        const regex = this.patternToRegex(pattern);
        const keys = [];
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                const entry = this.cache.get(key);
                if (entry && !this.isExpired(entry)) {
                    keys.push(key);
                }
            }
        }
        return keys;
    }
    patternToRegex(pattern) {
        const escaped = pattern
            .replace(/[.+^${}()|[\]\\]/g, '\\$&')
            .replace(/\*/g, '.*');
        return new RegExp(`^${escaped}$`);
    }
    async invalidateTag(tag) {
        const keys = await this.getKeysByTag(tag);
        for (const key of keys) {
            await this.del(key);
        }
        this.tagIndex.delete(tag);
    }
    async addToTag(tag, key) {
        if (!this.tagIndex.has(tag)) {
            this.tagIndex.set(tag, new Set());
        }
        this.tagIndex.get(tag).add(key);
    }
    async getKeysByTag(tag) {
        const keys = this.tagIndex.get(tag);
        return keys ? Array.from(keys) : [];
    }
    getSize() {
        return this.cache.size;
    }
}
exports.MemoryAdapter = MemoryAdapter;
//# sourceMappingURL=memory.adapter.js.map