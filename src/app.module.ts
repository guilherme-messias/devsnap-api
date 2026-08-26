import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EpisodesModule } from './modules/episodes/episodes.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { StacksModule } from './modules/stacks/stacks.module';
import { AnnotationsModule } from './modules/annotations/annotations.module';
import { EpisodeReviewModule } from './modules/episode-review/episode-review.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    EpisodesModule,
    StacksModule,
    PrismaModule,
    AnnotationsModule,
    EpisodeReviewModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
