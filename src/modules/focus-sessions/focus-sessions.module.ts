import { Module } from '@nestjs/common';
import { PrismaModule } from '@infrastructure/prisma/prisma.module';
import { CreateFocusSessionController } from './controllers/create-focus-session.controller';
import { GetFocusSessionController } from './controllers/get-focus-session.controller';
import { UpdateFocusSessionController } from './controllers/update-focus-session.controller';
import { ReviewFocusSessionItemController } from './controllers/review-focus-session-item.controller';
import { SkipFocusSessionItemController } from './controllers/skip-focus-session-item.controller';
import { FinishFocusSessionController } from './controllers/finish-focus-session.controller';
import { FetchFocusSessionsHistoryController } from './controllers/fetch-focus-sessions-history.controller';
import { CreateFocusSessionService } from './services/create-focus-session.service';
import { GetFocusSessionService } from './services/get-focus-session.service';
import { UpdateFocusSessionService } from './services/update-focus-session.service';
import { ReviewFocusSessionItemService } from './services/review-focus-session-item.service';
import { SkipFocusSessionItemService } from './services/skip-focus-session-item.service';
import { FinishFocusSessionService } from './services/finish-focus-session.service';
import { FetchFocusSessionsHistoryService } from './services/fetch-focus-sessions-history.service';
import { AuthModule } from '@infrastructure/auth/auth.module';

@Module({
  controllers: [
    CreateFocusSessionController,
    FetchFocusSessionsHistoryController,
    GetFocusSessionController,
    UpdateFocusSessionController,
    ReviewFocusSessionItemController,
    SkipFocusSessionItemController,
    FinishFocusSessionController,
  ],
  imports: [PrismaModule, AuthModule],
  providers: [
    CreateFocusSessionService,
    GetFocusSessionService,
    UpdateFocusSessionService,
    ReviewFocusSessionItemService,
    SkipFocusSessionItemService,
    FinishFocusSessionService,
    FetchFocusSessionsHistoryService,
  ],
})
export class FocusSessionsModule {}
