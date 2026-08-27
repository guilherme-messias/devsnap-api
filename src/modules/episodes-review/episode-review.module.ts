import { Module } from '@nestjs/common';
import { PrismaModule } from '@prisma/prisma.module';
import { CreateEpisodeReviewController } from './controllers/create-episode-review.controller';
import { CreateEpisodeReviewService } from './services/create-episode-review.service';
import { FetchEpisodeReviewByIdController } from './controllers/fetch-episode-review-by-id.controller';
import { FetchEpisodeReviewByIdService } from './services/fetch-episode-review-by-id.service';

@Module({
  controllers: [
    CreateEpisodeReviewController,
    FetchEpisodeReviewByIdController,
  ],
  imports: [PrismaModule],
  providers: [CreateEpisodeReviewService, FetchEpisodeReviewByIdService],
})
export class EpisodeReviewModule {}
