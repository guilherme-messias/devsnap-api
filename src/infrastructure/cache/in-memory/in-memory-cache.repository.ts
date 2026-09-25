import { Injectable } from '@nestjs/common';
import { CacheRepository } from '../cache-repository';

@Injectable()
export class InMemoryCacheRepository implements CacheRepository {
  private readonly store = new Map<string, string>();

  async set(key: string, value: string, _ttlInSeconds?: number): Promise<void> {
    this.store.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}
