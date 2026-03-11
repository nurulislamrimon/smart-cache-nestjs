import { Module, Global, DynamicModule, Provider, OnModuleDestroy } from '@nestjs/common';
import { SmartCache, CacheOptions } from '../services/smart-cache.service';
import { RedisAdapter } from '../adapters/redis.adapter';
import { MemoryAdapter } from '../adapters/memory.adapter';
import { KeyBuilder } from '../core/key-builder';
import { Serializer } from '../core/serializer';
import { StampedeProtection } from '../core/stampede';

export const SMART_CACHE_OPTIONS = 'SMART_CACHE_OPTIONS';

@Global()
@Module({})
export class SmartCacheModule implements OnModuleDestroy {
  static forRoot(options: CacheOptions = {}): DynamicModule {
    return {
      module: SmartCacheModule,
      providers: [
        {
          provide: SmartCache,
          useFactory: () => new SmartCache(options),
        },
      ],
      exports: [SmartCache],
    };
  }

  static forRootAsync(options: {
    useFactory: (...args: any[]) => CacheOptions | Promise<CacheOptions>;
    inject?: any[];
  }): DynamicModule {
    const provider: Provider = {
      provide: SmartCache,
      useFactory: async (...args: any[]) => {
        const opts = await options.useFactory(...args);
        return new SmartCache(opts);
      },
      inject: options.inject || [],
    };

    return {
      module: SmartCacheModule,
      providers: [provider],
      exports: [SmartCache],
    };
  }

  async onModuleDestroy(): Promise<void> {}
}

export { SmartCache, CacheOptions, CacheStats } from '../services/smart-cache.service';
export { Cache, Evict } from '../decorators/cacheable.decorator';
export { CacheInterceptor, CacheEvictInterceptor } from '../decorators/cache.interceptor';
