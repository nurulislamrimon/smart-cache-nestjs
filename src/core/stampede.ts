export class StampedeProtection {
  private promises: Map<string, Promise<unknown>> = new Map();
  private ttl: number;

  constructor(ttl: number = 10) {
    this.ttl = ttl;
  }

  async execute<T>(
    key: string,
    fn: () => Promise<T>,
  ): Promise<T> {
    const existingPromise = this.promises.get(key);
    
    if (existingPromise) {
      return existingPromise as Promise<T>;
    }

    const promise = fn().finally(() => {
      setTimeout(() => {
        this.promises.delete(key);
      }, this.ttl * 1000);
    });

    this.promises.set(key, promise);

    return promise;
  }

  clear(key: string): void {
    this.promises.delete(key);
  }

  clearAll(): void {
    this.promises.clear();
  }

  isPending(key: string): boolean {
    return this.promises.has(key);
  }
}
