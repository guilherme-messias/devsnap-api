import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EpisodesModule } from './modules/episodes/episodes.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { StacksModule } from './modules/stacks/stacks.module';
import { AnnotationsModule } from './modules/annotations/annotations.module';
import { EpisodeReviewsModule } from './modules/episode-reviews/episode-reviews.module';
import { FocusSessionsModule } from './modules/focus-sessions/focus-sessions.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './infrastructure/auth/auth.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { RedisModule } from '@infrastructure/cache/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    EpisodesModule,
    StacksModule,
    AnnotationsModule,
    EpisodeReviewsModule,
    FocusSessionsModule,
    UsersModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
