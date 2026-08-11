import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { CreateEpisodeController } from './controllers/create-episode.controller';
import { FetchRecentEpisodesController } from './controllers/fetch-recent-episodes.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [
    AppController,
    CreateEpisodeController,
    FetchRecentEpisodesController,
  ],
  providers: [AppService, PrismaService],
})
export class AppModule {}
