"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheEvict = exports.CACHE_EVICT_TAG_METADATA = exports.CACHE_EVICT_ALL_METADATA = exports.CACHE_EVICT_KEY_METADATA = void 0;
const common_1 = require("@nestjs/common");
exports.CACHE_EVICT_KEY_METADATA = 'cache:evict:key';
exports.CACHE_EVICT_ALL_METADATA = 'cache:evict:all';
exports.CACHE_EVICT_TAG_METADATA = 'cache:evict:tag';
const CacheEvict = (options) => {
    const opts = typeof options === 'string'
        ? { key: options }
        : options;
    return (target, propertyKey, descriptor) => {
        if (opts.key) {
            (0, common_1.SetMetadata)(exports.CACHE_EVICT_KEY_METADATA, opts.key)(target, propertyKey);
        }
        if (opts.pattern) {
            (0, common_1.SetMetadata)(exports.CACHE_EVICT_KEY_METADATA, opts.pattern)(target, propertyKey);
        }
        if (opts.tag) {
            (0, common_1.SetMetadata)(exports.CACHE_EVICT_TAG_METADATA, opts.tag)(target, propertyKey);
        }
        if (opts.all) {
            (0, common_1.SetMetadata)(exports.CACHE_EVICT_ALL_METADATA, true)(target, propertyKey);
        }
        return descriptor;
    };
};
exports.CacheEvict = CacheEvict;
//# sourceMappingURL=cache-evict.decorator.js.map