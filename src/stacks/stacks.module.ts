import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CreateStackController } from './controllers/create-stack.controller';
import { CreateStackService } from './services/create-stack.service';

@Module({
  controllers: [CreateStackController],
  imports: [PrismaModule],
  providers: [CreateStackService],
})
export class StacksModule {}
