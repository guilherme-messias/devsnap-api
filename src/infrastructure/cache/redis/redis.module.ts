import { Module } from '@nestjs/common';
import { CacheRepository } from '../cache-repository';
import { RedisService } from './redis.service';

@Module({
  providers: [{ provide: CacheRepository, useClass: RedisService }],
  exports: [CacheRepository],
})
export class RedisModule {}
