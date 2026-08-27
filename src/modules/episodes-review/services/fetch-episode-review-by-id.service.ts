import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';

@Injectable()
export class FetchEpisodeReviewByIdService {
  constructor(private readonly prisma: PrismaService) {}

  async fetchEpisodeReviewById(id: string, episodeId: string) {
    const episodeReview = await this.prisma.episodeReview.findUnique({
      where: { id },
    });

    if (!episodeReview || episodeReview.episodeId !== episodeId) {
      return null;
    }

    return episodeReview;
  }
}
