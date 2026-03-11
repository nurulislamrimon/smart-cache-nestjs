import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { SmartCache } from '../services/smart-cache.service';
import { CACHE_KEY, CACHE_TTL, CACHE_EVICT, CACHE_TAG } from './cacheable.decorator';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    @Inject(SmartCache) private cache: SmartCache,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const key = this.reflector.get<string>(CACHE_KEY, context.getHandler());
    if (!key) return next.handle();

    const ttl = this.reflector.get<number>(CACHE_TTL, context.getHandler());
    const request = context.switchToHttp().getRequest();
    const cacheKey = this.buildKey(key, request);

    return next.handle().pipe(
      tap(data => this.cache.set(cacheKey, data, ttl)),
    );
  }

  private buildKey(base: string, req: any): string {
    const params = { ...req.params, ...req.query };
    const keys = Object.keys(params).sort();
    if (keys.length === 0) return base;
    return this.cache.key(base, params);
  }
}

@Injectable()
export class CacheEvictInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    @Inject(SmartCache) private cache: SmartCache,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const key = this.reflector.get<string>(CACHE_EVICT, context.getHandler());
    const tag = this.reflector.get<string>(CACHE_TAG, context.getHandler());

    return next.handle().pipe(
      tap(async () => {
        if (tag) await this.cache.invalidate(tag);
        else if (key) await this.cache.del(key);
      }),
    );
  }
}
