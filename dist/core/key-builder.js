"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyBuilder = void 0;
class KeyBuilder {
    constructor(prefix = '') {
        this.prefix = prefix;
    }
    setPrefix(prefix) {
        this.prefix = prefix;
    }
    build(...args) {
        if (args.length === 0) {
            return this.prefix;
        }
        const parts = [];
        for (const arg of args) {
            if (typeof arg === 'string' || typeof arg === 'number') {
                parts.push(String(arg));
            }
            else if (typeof arg === 'object' && arg !== null) {
                const sortedKeys = Object.keys(arg).sort();
                for (const k of sortedKeys) {
                    const v = arg[k];
                    if (v !== undefined && v !== null) {
                        if (typeof v === 'object') {
                            parts.push(`${k}=${JSON.stringify(v)}`);
                        }
                        else {
                            parts.push(`${k}=${v}`);
                        }
                    }
                }
            }
        }
        return parts.length > 0
            ? this.prefix
                ? `${this.prefix}:${parts.join(':')}`
                : parts.join(':')
            : this.prefix;
    }
    buildPattern(key) {
        if (key.includes('*')) {
            return this.prefix ? `${this.prefix}:${key}` : key;
        }
        return this.prefix ? `${this.prefix}:${key}` : key;
    }
}
exports.KeyBuilder = KeyBuilder;
//# sourceMappingURL=key-builder.js.map