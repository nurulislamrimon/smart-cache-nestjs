import Redis from 'ioredis';
import { ICacheAdapter } from '../interfaces/cache-options.interface';
export declare class RedisAdapter implements ICacheAdapter {
    private retryAttempts;
    private retryDelay;
    private redis;
    private serializer;
    private tagPrefix;
    private isConnected;
    constructor(url: string, retryAttempts?: number, retryDelay?: number);
    private createClient;
    private setupEventHandlers;
    connect(): Promise<void>;
    private safeExecute;
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    clear(): Promise<void>;
    exists(key: string): Promise<boolean>;
    getKeys(pattern: string): Promise<string[]>;
    invalidateTag(tag: string): Promise<void>;
    addToTag(tag: string, key: string): Promise<void>;
    getKeysByTag(tag: string): Promise<string[]>;
    disconnect(): Promise<void>;
    getClient(): Redis;
}
