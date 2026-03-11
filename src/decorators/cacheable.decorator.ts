import 'reflect-metadata';
import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY = 'cache:key';
export const CACHE_TTL = 'cache:ttl';
export const CACHE_EVICT = 'cache:evict';
export const CACHE_TAG = 'cache:tag';

export interface CacheOptions {
  ttl?: number;
  tag?: string;
}

export function Cache(key: string, options?: CacheOptions) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(CACHE_KEY, key, descriptor.value);
    if (options?.ttl) {
      Reflect.defineMetadata(CACHE_TTL, options.ttl, descriptor.value);
    }
    if (options?.tag) {
      Reflect.defineMetadata(CACHE_TAG, options.tag, descriptor.value);
    }
    return descriptor;
  };
}

export function Evict(keyOrOptions?: string | { key?: string; tag?: string }, tag?: string) {
  const options = typeof keyOrOptions === 'string' ? { key: keyOrOptions, tag } : keyOrOptions || {};
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    if (options.key) {
      Reflect.defineMetadata(CACHE_EVICT, options.key, descriptor.value);
    }
    if (options.tag) {
      Reflect.defineMetadata(CACHE_TAG, options.tag, descriptor.value);
    }
    return descriptor;
  };
}
