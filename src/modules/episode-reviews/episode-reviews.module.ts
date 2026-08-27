import { Module } from '@nestjs/common';
import { PrismaModule } from '@prisma/prisma.module';
import { CreateEpisodeReviewController } from './controllers/create-episode-review.controller';
import { CreateEpisodeReviewService } from './services/create-episode-review.service';
import { FetchEpisodeReviewByIdController } from './controllers/fetch-episode-review-by-id.controller';
import { FetchEpisodeReviewByIdService } from './services/fetch-episode-review-by-id.service';
import { FetchRecentEpisodeReviewsController } from './controllers/fetch-recent-episode-reviews.controller';
import { FetchRecentEpisodeReviewsService } from './services/fetch-recent-episode-reviews.service';

@Module({
  controllers: [
    CreateEpisodeReviewController,
    FetchEpisodeReviewByIdController,
    FetchRecentEpisodeReviewsController,
  ],
  imports: [PrismaModule],
  providers: [
    CreateEpisodeReviewService,
    FetchEpisodeReviewByIdService,
    FetchRecentEpisodeReviewsService,
  ],
})
export class EpisodeReviewsModule {}
