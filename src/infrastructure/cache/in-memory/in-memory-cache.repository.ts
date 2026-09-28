import { Injectable } from '@nestjs/common';
import { CacheRepository } from '../cache-repository';

@Injectable()
export class InMemoryCacheRepository implements CacheRepository {
  private readonly store = new Map<string, string>();

  set(key: string, value: string, _ttlInSeconds?: number): Promise<void> {
    this.store.set(key, value);
    return Promise.resolve();
  }

  get(key: string): Promise<string | null> {
    return Promise.resolve(this.store.get(key) ?? null);
  }

  delete(key: string): Promise<void> {
    this.store.delete(key);
    return Promise.resolve();
  }

  clear(): void {
    this.store.clear();
  }
}
