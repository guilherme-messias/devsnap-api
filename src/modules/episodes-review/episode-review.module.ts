import { Module } from '@nestjs/common';
import { PrismaModule } from '@prisma/prisma.module';
import { CreateEpisodeReviewController } from './controllers/create-episode-review.controller';
import { CreateEpisodeReviewService } from './services/create-episode-review.service';

@Module({
  controllers: [CreateEpisodeReviewController],
  imports: [PrismaModule],
  providers: [CreateEpisodeReviewService],
})
export class EpisodeReviewModule {}
