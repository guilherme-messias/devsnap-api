import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [],
  imports: [PrismaModule],
  providers: [],
})
export class StacksModule {}
