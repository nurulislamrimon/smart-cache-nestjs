export declare class StampedeProtection {
    private promises;
    private ttl;
    constructor(ttl?: number);
    execute<T>(key: string, fn: () => Promise<T>): Promise<T>;
    clear(key: string): void;
    clearAll(): void;
    isPending(key: string): boolean;
}
