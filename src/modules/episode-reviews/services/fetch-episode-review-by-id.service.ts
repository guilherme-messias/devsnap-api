import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';

@Injectable()
export class FetchEpisodeReviewByIdService {
  constructor(private readonly prisma: PrismaService) {}

  async fetchEpisodeReviewById(id: string, episodeId: string, userId: string) {
    const episodeReview = await this.prisma.episodeReview.findFirst({
      where: {
        id,
        episodeId,
        episode: { stack: { userId } },
      },
    });

    return episodeReview;
  }
}
