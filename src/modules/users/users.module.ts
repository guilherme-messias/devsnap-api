import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/infrastructure/prisma/prisma.module';

@Module({
  controllers: [],
  imports: [PrismaModule],
  providers: [],
})
export class UsersModule {}
