import { Module } from '@nestjs/common';
import { PrismaModule } from '@infrastructure/prisma/prisma.module';
import { GetDashboardController } from './controllers/get-dashboard.controller';
import { GetDashboardService } from './services/get-dashboard.service';
import { AuthModule } from '@infrastructure/auth/auth.module';
import { RedisModule } from '@infrastructure/cache/redis/redis.module';

@Module({
  controllers: [GetDashboardController],
  imports: [PrismaModule, AuthModule, RedisModule],
  providers: [GetDashboardService],
})
export class DashboardModule {}
