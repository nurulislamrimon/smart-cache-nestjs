# smart-cache-nestjs

Minimal Redis caching for NestJS v10/v11. Reduced to the smallest possible code.

**Author**: [Nurul Islam Rimon](https://github.com/nurulislamrimon)  
**GitHub**: https://github.com/nurulislamrimon/smart-cache-nestjs

## Install

```bash
npm install smart-cache-nestjs ioredis
```

## Quick Setup

```typescript
// app.module.ts
import { SmartCacheModule } from 'smart-cache-nestjs';

@Module({
  imports: [
    SmartCacheModule.forRoot({ 
      url: 'redis://localhost:6379' 
    }),
  ],
})
export class AppModule {}
```

## Usage

```typescript
// Inject and use
@Injectable()
class UserService {
  constructor(private cache: SmartCache) {}

  async findAll() {
    return this.cache.remember('users', () => this.db.users.findMany());
  }

  async findById(id: number) {
    return this.cache.remember(`user:${id}`, () => this.db.users.find(id));
  }

  async create(data: any) {
    const user = await this.db.users.create(data);
    await this.cache.invalidate('users');  // Clear list cache
    return user;
  }
}
```

## API

### `cache.remember(key, fn, ttl?)`
The main method. Returns cached value or executes fn and caches result.

```typescript
const users = await cache.remember('users', () => db.findAll(), 60);
```

### `cache.get(key)`, `cache.set(key, value, ttl?)`
Basic get/set operations.

```typescript
await cache.set('key', data, 30);
const data = await cache.get('key');
```

### `cache.key(...)`
Build cache keys with automatic prefix.

```typescript
cache.key('users', { page: 1, limit: 10 })
// → "app:users:page=1:limit=10"
```

### `cache.invalidate(tag)` / `cache.del(key)`
Invalidate by tag or key.

```typescript
await cache.invalidate('users');
await cache.del('user:123');
```

### `cache.stats()`
Get hit/miss stats.

```typescript
const { hits, misses, hitRate } = cache.stats();
```

## Decorators

```typescript
class UserService {
  @Cache('users')
  async findAll() { return this.db.findAll(); }

  @Cache('user:{id}')
  async findById(id: number) { return this.db.find(id); }

  @Evict('users')
  async create(data: any) { return this.db.create(data); }

  @Evict({ tag: 'products' })
  async updateProduct() { ... }
}
```

## Config

```typescript
SmartCacheModule.forRoot({
  url: 'redis://localhost:6379',
  prefix: 'app',      // key prefix
  ttl: 60,           // default TTL in seconds
  memory: true,      // L1 memory cache
  memoryTTL: 5,      // L1 TTL in seconds
  memorySize: 500,  // L1 max entries
})
```

## Async Config

```typescript
SmartCacheModule.forRootAsync({
  useFactory: (config: ConfigService) => ({
    url: config.get('REDIS_URL'),
  }),
  inject: [ConfigService],
})
```

That's it. No boilerplate.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT
