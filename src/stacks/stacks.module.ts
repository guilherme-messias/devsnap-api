import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CreateStackController } from './controllers/create-stack.controller';
import { CreateStackService } from './services/create-stack.service';
import { DeleteStackByIdController } from './controllers/delete-stack-by-id.controller';
import { DeleteStackByIdService } from './services/delete-stack-by-id.service';

@Module({
  controllers: [CreateStackController, DeleteStackByIdController],
  imports: [PrismaModule],
  providers: [CreateStackService, DeleteStackByIdService],
})
export class StacksModule {}
