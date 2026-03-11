"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheEvictInterceptor = exports.CacheInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const core_1 = require("@nestjs/core");
const smart_cache_service_1 = require("../services/smart-cache.service");
const cacheable_decorator_1 = require("./cacheable.decorator");
let CacheInterceptor = class CacheInterceptor {
    constructor(reflector, cache) {
        this.reflector = reflector;
        this.cache = cache;
    }
    intercept(context, next) {
        const key = this.reflector.get(cacheable_decorator_1.CACHE_KEY, context.getHandler());
        if (!key)
            return next.handle();
        const ttl = this.reflector.get(cacheable_decorator_1.CACHE_TTL, context.getHandler());
        const request = context.switchToHttp().getRequest();
        const cacheKey = this.buildKey(key, request);
        return next.handle().pipe((0, operators_1.tap)(data => this.cache.set(cacheKey, data, ttl)));
    }
    buildKey(base, req) {
        const params = { ...req.params, ...req.query };
        const keys = Object.keys(params).sort();
        if (keys.length === 0)
            return base;
        return this.cache.key(base, params);
    }
};
exports.CacheInterceptor = CacheInterceptor;
exports.CacheInterceptor = CacheInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(smart_cache_service_1.SmartCache)),
    __metadata("design:paramtypes", [core_1.Reflector,
        smart_cache_service_1.SmartCache])
], CacheInterceptor);
let CacheEvictInterceptor = class CacheEvictInterceptor {
    constructor(reflector, cache) {
        this.reflector = reflector;
        this.cache = cache;
    }
    intercept(context, next) {
        const key = this.reflector.get(cacheable_decorator_1.CACHE_EVICT, context.getHandler());
        const tag = this.reflector.get(cacheable_decorator_1.CACHE_TAG, context.getHandler());
        return next.handle().pipe((0, operators_1.tap)(async () => {
            if (tag)
                await this.cache.invalidate(tag);
            else if (key)
                await this.cache.del(key);
        }));
    }
};
exports.CacheEvictInterceptor = CacheEvictInterceptor;
exports.CacheEvictInterceptor = CacheEvictInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(smart_cache_service_1.SmartCache)),
    __metadata("design:paramtypes", [core_1.Reflector,
        smart_cache_service_1.SmartCache])
], CacheEvictInterceptor);
//# sourceMappingURL=cache.interceptor.js.map