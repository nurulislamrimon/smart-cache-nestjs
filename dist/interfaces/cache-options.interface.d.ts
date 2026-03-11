export interface CacheOptions {
    url?: string;
    prefix?: string;
    defaultTTL?: number;
    memoryCache?: boolean;
    memoryTTL?: number;
    memoryMaxSize?: number;
    enableStampedeProtection?: boolean;
    stampedeTTL?: number;
    retryAttempts?: number;
    retryDelay?: number;
}
export interface SetOptions {
    ttl?: number;
    tags?: string[];
}
export interface CacheMetadata {
    key: string;
    ttl?: number;
    tags?: string[];
}
export interface CacheStats {
    hits: number;
    misses: number;
    keys: number;
    hitRate: number;
}
export interface WrapOptions {
    ttl?: number;
    tags?: string[];
}
export type AsyncFunction<T> = () => Promise<T>;
export interface ICacheAdapter {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    clear(): Promise<void>;
    exists(key: string): Promise<boolean>;
    getKeys(pattern: string): Promise<string[]>;
    invalidateTag(tag: string): Promise<void>;
    addToTag(tag: string, key: string): Promise<void>;
    getKeysByTag(tag: string): Promise<string[]>;
}
export interface ICacheService {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, options?: SetOptions): Promise<void>;
    del(key: string): Promise<void>;
    clear(): Promise<void>;
    exists(key: string): Promise<boolean>;
    wrap<T>(key: string, fn: AsyncFunction<T>, options?: WrapOptions): Promise<T>;
    invalidateTag(tag: string): Promise<void>;
    key(...args: (string | number | Record<string, unknown>)[]): string;
    stats(): CacheStats;
    resetStats(): void;
}
export interface ModuleOptions extends CacheOptions {
}
