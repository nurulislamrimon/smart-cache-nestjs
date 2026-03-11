"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StampedeProtection = void 0;
class StampedeProtection {
    constructor(ttl = 10) {
        this.promises = new Map();
        this.ttl = ttl;
    }
    async execute(key, fn) {
        const existingPromise = this.promises.get(key);
        if (existingPromise) {
            return existingPromise;
        }
        const promise = fn().finally(() => {
            setTimeout(() => {
                this.promises.delete(key);
            }, this.ttl * 1000);
        });
        this.promises.set(key, promise);
        return promise;
    }
    clear(key) {
        this.promises.delete(key);
    }
    clearAll() {
        this.promises.clear();
    }
    isPending(key) {
        return this.promises.has(key);
    }
}
exports.StampedeProtection = StampedeProtection;
//# sourceMappingURL=stampede.js.map