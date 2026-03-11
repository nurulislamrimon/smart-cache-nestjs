export declare class Serializer {
    serialize<T>(value: T): string;
    deserialize<T>(value: string | null): T | null;
}
