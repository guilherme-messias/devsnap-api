import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CreateStackController } from './controllers/create-stack.controller';
import { CreateStackService } from './services/create-stack.service';
import { DeleteStackByIdController } from './controllers/delete-stack-by-id.controller';
import { DeleteStackByIdService } from './services/delete-stack-by-id.service';
import { FetchStackByIdController } from './controllers/fetch-stack-by-id.controller';
import { FetchStackByIdService } from './services/fetch-stack-by-id.service';
import { FetchRecentStacksController } from './controllers/fetch-recent-stacks.controller';
import { FetchRecentStacksService } from './services/fetch-recent-stacks.service';
import { UpdateStackController } from './controllers/update-stack.controller';
import { UpdateStackService } from './services/update-stack.service';

@Module({
  controllers: [
    CreateStackController,
    DeleteStackByIdController,
    FetchStackByIdController,
    FetchRecentStacksController,
    UpdateStackController,
  ],
  imports: [PrismaModule],
  providers: [
    CreateStackService,
    DeleteStackByIdService,
    FetchStackByIdService,
    FetchRecentStacksService,
    UpdateStackService,
  ],
})
export class StacksModule {}
