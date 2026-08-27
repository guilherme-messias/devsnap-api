import { Module } from '@nestjs/common';
import { PrismaModule } from '@prisma/prisma.module';
import { CreateEpisodeReviewController } from './controllers/create-episode-review.controller';
import { CreateEpisodeReviewService } from './services/create-episode-review.service';
import { FetchEpisodeReviewByIdController } from './controllers/fetch-episode-review-by-id.controller';
import { FetchEpisodeReviewByIdService } from './services/fetch-episode-review-by-id.service';
import { FetchRecentEpisodeReviewsController } from './controllers/fetch-recent-episode-reviews.controller';
import { FetchRecentEpisodeReviewsService } from './services/fetch-recent-episode-reviews.service';
import { DeleteLastEpisodeReviewController } from './controllers/delete-last-episode-review.controller';
import { DeleteLastEpisodeReviewService } from './services/delete-last-episode-review.service';

@Module({
  controllers: [
    CreateEpisodeReviewController,
    FetchEpisodeReviewByIdController,
    FetchRecentEpisodeReviewsController,
    DeleteLastEpisodeReviewController,
  ],
  imports: [PrismaModule],
  providers: [
    CreateEpisodeReviewService,
    FetchEpisodeReviewByIdService,
    FetchRecentEpisodeReviewsService,
    DeleteLastEpisodeReviewService,
  ],
})
export class EpisodeReviewsModule {}
