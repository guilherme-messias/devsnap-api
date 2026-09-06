import { Module } from '@nestjs/common';
import { PrismaModule } from '@prisma/prisma.module';
import { GetDashboardController } from './controllers/get-dashboard.controller';
import { GetDashboardService } from './services/get-dashboard.service';

@Module({
  controllers: [GetDashboardController],
  imports: [PrismaModule],
  providers: [GetDashboardService],
})
export class DashboardModule {}
