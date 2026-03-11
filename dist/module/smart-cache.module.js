"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SmartCacheModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheEvictInterceptor = exports.CacheInterceptor = exports.Evict = exports.Cache = exports.SmartCache = exports.SmartCacheModule = exports.SMART_CACHE_OPTIONS = void 0;
const common_1 = require("@nestjs/common");
const smart_cache_service_1 = require("../services/smart-cache.service");
exports.SMART_CACHE_OPTIONS = 'SMART_CACHE_OPTIONS';
let SmartCacheModule = SmartCacheModule_1 = class SmartCacheModule {
    static forRoot(options = {}) {
        return {
            module: SmartCacheModule_1,
            providers: [
                {
                    provide: smart_cache_service_1.SmartCache,
                    useFactory: () => new smart_cache_service_1.SmartCache(options),
                },
            ],
            exports: [smart_cache_service_1.SmartCache],
        };
    }
    static forRootAsync(options) {
        const provider = {
            provide: smart_cache_service_1.SmartCache,
            useFactory: async (...args) => {
                const opts = await options.useFactory(...args);
                return new smart_cache_service_1.SmartCache(opts);
            },
            inject: options.inject || [],
        };
        return {
            module: SmartCacheModule_1,
            providers: [provider],
            exports: [smart_cache_service_1.SmartCache],
        };
    }
    async onModuleDestroy() { }
};
exports.SmartCacheModule = SmartCacheModule;
exports.SmartCacheModule = SmartCacheModule = SmartCacheModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({})
], SmartCacheModule);
var smart_cache_service_2 = require("../services/smart-cache.service");
Object.defineProperty(exports, "SmartCache", { enumerable: true, get: function () { return smart_cache_service_2.SmartCache; } });
var cacheable_decorator_1 = require("../decorators/cacheable.decorator");
Object.defineProperty(exports, "Cache", { enumerable: true, get: function () { return cacheable_decorator_1.Cache; } });
Object.defineProperty(exports, "Evict", { enumerable: true, get: function () { return cacheable_decorator_1.Evict; } });
var cache_interceptor_1 = require("../decorators/cache.interceptor");
Object.defineProperty(exports, "CacheInterceptor", { enumerable: true, get: function () { return cache_interceptor_1.CacheInterceptor; } });
Object.defineProperty(exports, "CacheEvictInterceptor", { enumerable: true, get: function () { return cache_interceptor_1.CacheEvictInterceptor; } });
//# sourceMappingURL=smart-cache.module.js.map