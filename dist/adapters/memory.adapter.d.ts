import { ICacheAdapter } from '../interfaces/cache-options.interface';
export declare class MemoryAdapter implements ICacheAdapter {
    private cache;
    private accessOrder;
    private serializer;
    private maxSize;
    private ttl;
    private tagIndex;
    constructor(maxSize?: number, ttl?: number);
    private evictIfNeeded;
    private removeFromTagIndex;
    private isExpired;
    private updateAccess;
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    clear(): Promise<void>;
    exists(key: string): Promise<boolean>;
    getKeys(pattern: string): Promise<string[]>;
    private patternToRegex;
    invalidateTag(tag: string): Promise<void>;
    addToTag(tag: string, key: string): Promise<void>;
    getKeysByTag(tag: string): Promise<string[]>;
    getSize(): number;
}
