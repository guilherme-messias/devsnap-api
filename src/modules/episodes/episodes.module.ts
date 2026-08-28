import { Module } from '@nestjs/common';
import { CreateEpisodeController } from './controllers/create-episode.controller';
import { FetchEpisodeByIdController } from './controllers/fetch-episode-by-id.controller';
import { FetchRecentEpisodesController } from './controllers/fetch-recent-episodes.controller';
import { PrismaModule } from '@prisma/prisma.module';
import { CreateEpisodeService } from './services/create-episode.service';
import { FetchEpisodeByIdService } from './services/fetch-episode-by-id.service';
import { FetchRecentEpisodesService } from './services/fetch-recent-episodes.service';
import { UpdateEpisodeController } from './controllers/update-episode.controller';
import { UpdateEpisodeService } from './services/update-episode.service';
import { DeleteEpisodeByIdController } from './controllers/delete-episode-by-id.controller';
import { DeleteEpisodeByIdService } from './services/delete-episode-by-id.service';

@Module({
  controllers: [
    CreateEpisodeController,
    FetchRecentEpisodesController,
    FetchEpisodeByIdController,
    UpdateEpisodeController,
    DeleteEpisodeByIdController,
  ],
  imports: [PrismaModule],
  providers: [
    CreateEpisodeService,
    FetchRecentEpisodesService,
    FetchEpisodeByIdService,
    UpdateEpisodeService,
    DeleteEpisodeByIdService,
  ],
})
export class EpisodesModule {}
