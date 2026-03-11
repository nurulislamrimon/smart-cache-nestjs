export class KeyBuilder {
  private prefix: string;

  constructor(prefix: string = '') {
    this.prefix = prefix;
  }

  setPrefix(prefix: string): void {
    this.prefix = prefix;
  }

  build(...args: (string | number | Record<string, unknown>)[]): string {
    if (args.length === 0) {
      return this.prefix;
    }

    const parts: string[] = [];

    for (const arg of args) {
      if (typeof arg === 'string' || typeof arg === 'number') {
        parts.push(String(arg));
      } else if (typeof arg === 'object' && arg !== null) {
        const sortedKeys = Object.keys(arg).sort();
        for (const k of sortedKeys) {
          const v = (arg as Record<string, unknown>)[k];
          if (v !== undefined && v !== null) {
            if (typeof v === 'object') {
              parts.push(`${k}=${JSON.stringify(v)}`);
            } else {
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

  buildPattern(key: string): string {
    if (key.includes('*')) {
      return this.prefix ? `${this.prefix}:${key}` : key;
    }
    return this.prefix ? `${this.prefix}:${key}` : key;
  }
}
