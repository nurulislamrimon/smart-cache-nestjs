export declare const CACHE_EVICT_KEY_METADATA = "cache:evict:key";
export declare const CACHE_EVICT_ALL_METADATA = "cache:evict:all";
export declare const CACHE_EVICT_TAG_METADATA = "cache:evict:tag";
export interface CacheEvictOptions {
    key?: string;
    pattern?: string;
    tag?: string;
    all?: boolean;
}
export declare const CacheEvict: (options: CacheEvictOptions | string) => (target: object, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
