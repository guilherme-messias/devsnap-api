import { Injectable } from '@nestjs/common';
import { CacheRepository } from '../cache-repository';
import { ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';

@Injectable()
export class RedisService implements CacheRepository {
  private readonly client: Redis;

  constructor(configService: ConfigService) {
    this.client = new Redis({
      url: configService.getOrThrow('UPSTASH_REDIS_REST_URL'),
      token: configService.getOrThrow('UPSTASH_REDIS_REST_TOKEN'),
    });
  }
  
  async set(key: string, value: string, ttlInSeconds?: number): Promise<void> {
    if (ttlInSeconds) {
      await this.client.set(key, value, { ex: ttlInSeconds });
      return;
    }
    await this.client.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }
}
