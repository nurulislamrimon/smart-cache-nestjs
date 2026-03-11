"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CACHE_TAG = exports.CACHE_EVICT = exports.CACHE_TTL = exports.CACHE_KEY = void 0;
exports.Cache = Cache;
exports.Evict = Evict;
require("reflect-metadata");
exports.CACHE_KEY = 'cache:key';
exports.CACHE_TTL = 'cache:ttl';
exports.CACHE_EVICT = 'cache:evict';
exports.CACHE_TAG = 'cache:tag';
function Cache(key, options) {
    return (target, propertyKey, descriptor) => {
        Reflect.defineMetadata(exports.CACHE_KEY, key, descriptor.value);
        if (options?.ttl) {
            Reflect.defineMetadata(exports.CACHE_TTL, options.ttl, descriptor.value);
        }
        if (options?.tag) {
            Reflect.defineMetadata(exports.CACHE_TAG, options.tag, descriptor.value);
        }
        return descriptor;
    };
}
function Evict(keyOrOptions, tag) {
    const options = typeof keyOrOptions === 'string' ? { key: keyOrOptions, tag } : keyOrOptions || {};
    return (target, propertyKey, descriptor) => {
        if (options.key) {
            Reflect.defineMetadata(exports.CACHE_EVICT, options.key, descriptor.value);
        }
        if (options.tag) {
            Reflect.defineMetadata(exports.CACHE_TAG, options.tag, descriptor.value);
        }
        return descriptor;
    };
}
//# sourceMappingURL=cacheable.decorator.js.map