import { DynamicModule, OnModuleDestroy } from '@nestjs/common';
import { CacheOptions } from '../services/smart-cache.service';
export declare const SMART_CACHE_OPTIONS = "SMART_CACHE_OPTIONS";
export declare class SmartCacheModule implements OnModuleDestroy {
    static forRoot(options?: CacheOptions): DynamicModule;
    static forRootAsync(options: {
        useFactory: (...args: any[]) => CacheOptions | Promise<CacheOptions>;
        inject?: any[];
    }): DynamicModule;
    onModuleDestroy(): Promise<void>;
}
export { SmartCache, CacheOptions, CacheStats } from '../services/smart-cache.service';
export { Cache, Evict } from '../decorators/cacheable.decorator';
export { CacheInterceptor, CacheEvictInterceptor } from '../decorators/cache.interceptor';
