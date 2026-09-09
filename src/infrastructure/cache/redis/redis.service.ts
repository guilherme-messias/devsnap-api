import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { CacheRepository } from '../cache-repository';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService
  implements CacheRepository, OnModuleInit, OnModuleDestroy
{
  private readonly client: RedisClientType;

  constructor(configService: ConfigService) {
    const url = configService.get<string>('REDIS_URL');
    if (!url) {
      throw new Error('REDIS_URL is not defined.');
    }

    this.client = createClient({
      url: process.env.REDIS_URL,
    });
  }
  async set(key: string, value: string, ttlInSeconds?: number): Promise<void> {
    if (ttlInSeconds) {
      await this.client.set(key, value, {
        expiration: { type: 'EX', value: ttlInSeconds },
      });
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

  async onModuleInit() {
    await this.client.connect();
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
