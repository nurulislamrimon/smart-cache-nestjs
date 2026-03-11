import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { RedisAdapter } from '../adapters/redis.adapter';
import { MemoryAdapter } from '../adapters/memory.adapter';
import { KeyBuilder } from '../core/key-builder';
import { Serializer } from '../core/serializer';
import { StampedeProtection } from '../core/stampede';

export interface CacheOptions {
  url?: string;
  prefix?: string;
  ttl?: number;
  memory?: boolean;
  memoryTTL?: number;
  memorySize?: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
}

@Injectable()
export class SmartCache implements OnModuleDestroy {
  private redis: RedisAdapter;
  private memory?: MemoryAdapter;
  private keyBuilder: KeyBuilder;
  private stampede: StampedeProtection;
  private serializer: Serializer;
  private defaultTTL: number;
  
  private hits = 0;
  private misses = 0;

  constructor(options: CacheOptions = {}) {
    const {
      url = 'redis://localhost:6379',
      prefix = 'app',
      ttl = 60,
      memory = true,
      memoryTTL = 5,
      memorySize = 500,
    } = options;

    this.defaultTTL = ttl;
    this.redis = new RedisAdapter(url);
    this.memory = memory ? new MemoryAdapter(memorySize, memoryTTL) : undefined;
    this.keyBuilder = new KeyBuilder(prefix);
    this.stampede = new StampedeProtection(10);
    this.serializer = new Serializer();
  }

  private async getRedis<T>(key: string): Promise<T | null> {
    const value = await this.redis.get<T>(key);
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

  private async getMemory<T>(key: string): Promise<T | null> {
    if (!this.memory) return null;
    const value = await this.memory.get<T>(key);
    if (value !== null) {
      this.hits++;
      return value;
    }
    return null;
  }

  async get<T>(key: string): Promise<T | null> {
    const memoryValue = await this.getMemory<T>(key);
    if (memoryValue !== null) return memoryValue;
    return this.getRedis<T>(key);
  }

  async set<T>(key: string, value: T, ttl = this.defaultTTL): Promise<void> {
    if (this.memory) {
      await this.memory.set(key, value, ttl);
    }
    await this.redis.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    if (this.memory) await this.memory.del(key);
    await this.redis.del(key);
  }

  async clear(): Promise<void> {
    if (this.memory) await this.memory.clear();
    await this.redis.clear();
    this.hits = 0;
    this.misses = 0;
  }

  async invalidate(tag: string): Promise<void> {
    if (this.memory) await this.memory.invalidateTag(tag);
    await this.redis.invalidateTag(tag);
  }

  async has(key: string): Promise<boolean> {
    if (this.memory && await this.memory.exists(key)) return true;
    return this.redis.exists(key);
  }

  async remember<T>(
    key: string | number,
    fn: () => Promise<T>,
    ttl = this.defaultTTL,
  ): Promise<T> {
    const cacheKey = this.key(key);
    const cached = await this.get<T>(cacheKey);
    if (cached !== null) return cached;

    const result = await this.stampede.execute(cacheKey, async () => {
      const existing = await this.get<T>(cacheKey);
      if (existing !== null) return existing;
      return fn();
    });

    await this.set(cacheKey, result, ttl);
    return result;
  }

  key(...args: (string | number | Record<string, unknown>)[]): string {
    return this.keyBuilder.build(...args);
  }

  stats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0,
    };
  }

  async onModuleDestroy(): Promise<void> {
    if (this.memory) await this.memory.clear();
    if ('disconnect' in this.redis) {
      await (this.redis as any).disconnect();
    }
  }
}
