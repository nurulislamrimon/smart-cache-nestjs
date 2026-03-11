export declare class KeyBuilder {
    private prefix;
    constructor(prefix?: string);
    setPrefix(prefix: string): void;
    build(...args: (string | number | Record<string, unknown>)[]): string;
    buildPattern(key: string): string;
}
