import { Module } from '@nestjs/common';
import { CreateEpisodeController } from './controllers/create-episode.controller';
import { FetchEpisodeByIdController } from './controllers/fetch-episode-by-id.controller';
import { FetchRecentEpisodesController } from './controllers/fetch-recent-episodes.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CreateEpisodeService } from './services/create-episode.service';
import { FetchEpisodeByIdService } from './services/fetch-episode-by-id.service';
import { FetchRecentEpisodesService } from './services/fetch-recent-episodes.service';

@Module({
  controllers: [
    CreateEpisodeController,
    FetchRecentEpisodesController,
    FetchEpisodeByIdController,
  ],
  imports: [PrismaModule],
  providers: [
    CreateEpisodeService,
    FetchRecentEpisodesService,
    FetchEpisodeByIdService,
  ],
})
export class EpisodesModule {}
