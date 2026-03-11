import Redis from 'ioredis';
import { ICacheAdapter } from '../interfaces/cache-options.interface';
import { Serializer } from '../core/serializer';

export class RedisAdapter implements ICacheAdapter {
  private redis: Redis;
  private serializer: Serializer;
  private tagPrefix = 'cache_tag:';
  private isConnected: boolean = false;

  constructor(
    url: string,
    private retryAttempts: number = 3,
    private retryDelay: number = 1000,
  ) {
    this.serializer = new Serializer();
    this.redis = this.createClient(url);
    this.setupEventHandlers();
  }

  private createClient(url: string): Redis {
    return new Redis(url, {
      maxRetriesPerRequest: this.retryAttempts,
      retryStrategy: (times: number) => {
        if (times > this.retryAttempts) {
          return null;
        }
        return Math.min(times * this.retryDelay, 5000);
      },
      lazyConnect: true,
    });
  }

  private setupEventHandlers(): void {
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

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.redis.connect().catch(() => {});
    }
  }

  private async safeExecute<T>(operation: () => Promise<T>): Promise<T | null> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      return await operation();
    } catch {
      return null;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    return this.safeExecute(async () => {
      const value = await this.redis.get(key);
      return this.serializer.deserialize<T>(value);
    });
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.safeExecute(async () => {
      const serialized = this.serializer.serialize(value);
      if (ttl && ttl > 0) {
        await this.redis.set(key, serialized, 'EX', ttl);
      } else {
        await this.redis.set(key, serialized);
      }
    });
  }

  async del(key: string): Promise<void> {
    await this.safeExecute(async () => {
      await this.redis.del(key);
    });
  }

  async clear(): Promise<void> {
    await this.safeExecute(async () => {
      const keys = await this.redis.keys('*');
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    });
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.safeExecute(async () => {
      const count = await this.redis.exists(key);
      return count === 1;
    });
    return result ?? false;
  }

  async getKeys(pattern: string): Promise<string[]> {
    const result = await this.safeExecute(async () => {
      return await this.redis.keys(pattern);
    });
    return result ?? [];
  }

  async invalidateTag(tag: string): Promise<void> {
    await this.safeExecute(async () => {
      const tagKey = `${this.tagPrefix}${tag}`;
      const keys = await this.redis.smembers(tagKey);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      await this.redis.del(tagKey);
    });
  }

  async addToTag(tag: string, key: string): Promise<void> {
    await this.safeExecute(async () => {
      const tagKey = `${this.tagPrefix}${tag}`;
      await this.redis.sadd(tagKey, key);
    });
  }

  async getKeysByTag(tag: string): Promise<string[]> {
    const result = await this.safeExecute(async () => {
      const tagKey = `${this.tagPrefix}${tag}`;
      return await this.redis.smembers(tagKey);
    });
    return result ?? [];
  }

  async disconnect(): Promise<void> {
    await this.redis.quit();
    this.isConnected = false;
  }

  getClient(): Redis {
    return this.redis;
  }
}
