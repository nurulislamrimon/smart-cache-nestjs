export class Serializer {
  serialize<T>(value: T): string {
    try {
      return JSON.stringify(value, (k, v) => {
        if (v instanceof Set) {
          return { __type: 'Set', data: Array.from(v) };
        }
        if (v instanceof Map) {
          return { __type: 'Map', data: Array.from(v.entries()) };
        }
        if (v instanceof Date) {
          return { __type: 'Date', value: v.toISOString() };
        }
        if (typeof v === 'symbol') {
          return { __type: 'Symbol', value: v.toString() };
        }
        if (typeof v === 'bigint') {
          return { __type: 'BigInt', value: v.toString() };
        }
        return v;
      });
    } catch (error) {
      throw new Error(`Failed to serialize value: ${error}`);
    }
  }

  deserialize<T>(value: string | null): T | null {
    if (value === null || value === undefined) {
      return null;
    }

    try {
      return JSON.parse(value, (k, v) => {
        if (v && typeof v === 'object' && '__type' in v) {
          switch (v.__type) {
            case 'Set':
              return new Set(v.data);
            case 'Map':
              return new Map(v.data);
            case 'Date':
              return new Date(v.value);
            case 'Symbol':
              return Symbol.for(v.value);
            case 'BigInt':
              return BigInt(v.value);
            default:
              return v;
          }
        }
        return v;
      });
    } catch (error) {
      throw new Error(`Failed to deserialize value: ${error}`);
    }
  }
}
