import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { SmartCache } from '../services/smart-cache.service';
export declare class CacheInterceptor implements NestInterceptor {
    private reflector;
    private cache;
    constructor(reflector: Reflector, cache: SmartCache);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    private buildKey;
}
export declare class CacheEvictInterceptor implements NestInterceptor {
    private reflector;
    private cache;
    constructor(reflector: Reflector, cache: SmartCache);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
