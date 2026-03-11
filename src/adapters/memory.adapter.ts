import { ICacheAdapter } from '../interfaces/cache-options.interface';
import { Serializer } from '../core/serializer';

interface CacheEntry<T> {
  value: T;
  expiry: number;
}

export class MemoryAdapter implements ICacheAdapter {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private accessOrder: string[] = [];
  private serializer: Serializer;
  private maxSize: number;
  private ttl: number;
  private tagIndex: Map<string, Set<string>> = new Map();

  constructor(maxSize: number = 1000, ttl: number = 300) {
    this.serializer = new Serializer();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  private evictIfNeeded(): void {
    while (this.cache.size >= this.maxSize && this.accessOrder.length > 0) {
      const oldestKey = this.accessOrder.shift();
      if (oldestKey) {
        this.removeFromTagIndex(oldestKey);
        this.cache.delete(oldestKey);
      }
    }
  }

  private removeFromTagIndex(key: string): void {
    for (const [, keys] of this.tagIndex) {
      keys.delete(key);
    }
  }

  private isExpired(entry: CacheEntry<unknown>): boolean {
    return entry.expiry > 0 && Date.now() > entry.expiry;
  }

  private updateAccess(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }
    if (this.isExpired(entry)) {
      this.del(key);
      return null;
    }
    this.updateAccess(key);
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    this.evictIfNeeded();
    const expiry = ttl && ttl > 0 ? Date.now() + ttl * 1000 : 0;
    this.cache.set(key, { value, expiry });
    this.updateAccess(key);
  }

  async del(key: string): Promise<void> {
    this.removeFromTagIndex(key);
    this.cache.delete(key);
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.accessOrder = [];
    this.tagIndex.clear();
  }

  async exists(key: string): Promise<boolean> {
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

  async getKeys(pattern: string): Promise<string[]> {
    const regex = this.patternToRegex(pattern);
    const keys: string[] = [];
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

  private patternToRegex(pattern: string): RegExp {
    const escaped = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*');
    return new RegExp(`^${escaped}$`);
  }

  async invalidateTag(tag: string): Promise<void> {
    const keys = await this.getKeysByTag(tag);
    for (const key of keys) {
      await this.del(key);
    }
    this.tagIndex.delete(tag);
  }

  async addToTag(tag: string, key: string): Promise<void> {
    if (!this.tagIndex.has(tag)) {
      this.tagIndex.set(tag, new Set());
    }
    this.tagIndex.get(tag)!.add(key);
  }

  async getKeysByTag(tag: string): Promise<string[]> {
    const keys = this.tagIndex.get(tag);
    return keys ? Array.from(keys) : [];
  }

  getSize(): number {
    return this.cache.size;
  }
}
