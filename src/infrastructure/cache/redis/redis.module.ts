import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheRepository } from '../cache-repository';
import { RedisService } from './redis.service';
import { TcpRedisCacheRepository } from './tcp-redis-cache.repository';

@Module({
  providers: [
    {
      provide: CacheRepository,
      useFactory: (config: ConfigService): CacheRepository => {
        const driver = config.get<string>('CACHE_DRIVER', 'upstash');

        if (driver === 'redis') {
          return new TcpRedisCacheRepository(config);
        }

        if (driver === 'upstash') {
          return new RedisService(config);
        }

        throw new Error(
          `CACHE_DRIVER inválido: "${driver}". Use "redis" ou "upstash".`,
        );
      },
      inject: [ConfigService],
    },
  ],
  exports: [CacheRepository],
})
export class RedisModule {}
