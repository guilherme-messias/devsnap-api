import { Module } from '@nestjs/common';
import { CreateEpisodeController } from './controllers/create-episode.controller';
import { FetchRecentEpisodesController } from './controllers/fetch-recent-episodes.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CreateEpisodeService } from './services/create-episode.service';
// import { FetchRecentEpisodesService } from './services/fetch-recent-episodes.service';

@Module({
  controllers: [CreateEpisodeController, FetchRecentEpisodesController],
  imports: [PrismaModule],
  providers: [
    CreateEpisodeService,
    // FetchRecentEpisodesService,
  ],
})
export class EpisodesModule {}
