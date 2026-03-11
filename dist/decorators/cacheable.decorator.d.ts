import 'reflect-metadata';
export declare const CACHE_KEY = "cache:key";
export declare const CACHE_TTL = "cache:ttl";
export declare const CACHE_EVICT = "cache:evict";
export declare const CACHE_TAG = "cache:tag";
export interface CacheOptions {
    ttl?: number;
    tag?: string;
}
export declare function Cache(key: string, options?: CacheOptions): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function Evict(keyOrOptions?: string | {
    key?: string;
    tag?: string;
}, tag?: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
