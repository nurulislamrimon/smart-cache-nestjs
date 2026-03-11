import { OnModuleDestroy } from '@nestjs/common';
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
export declare class SmartCache implements OnModuleDestroy {
    private redis;
    private memory?;
    private keyBuilder;
    private stampede;
    private serializer;
    private defaultTTL;
    private hits;
    private misses;
    constructor(options?: CacheOptions);
    private getRedis;
    private getMemory;
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    clear(): Promise<void>;
    invalidate(tag: string): Promise<void>;
    has(key: string): Promise<boolean>;
    remember<T>(key: string | number, fn: () => Promise<T>, ttl?: number): Promise<T>;
    key(...args: (string | number | Record<string, unknown>)[]): string;
    stats(): CacheStats;
    onModuleDestroy(): Promise<void>;
}
