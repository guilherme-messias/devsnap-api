import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';

@Injectable()
export class FetchRecentEpisodeReviewService {
  constructor(private prisma: PrismaService) {}

  async fetchRecentEpisodeReview(
    data: {
      page: number;
      perPage: number;
    },
    episodeId: string,
  ) {
    const { page, perPage } = data;

    const episode = await this.prisma.episode.findUnique({
      where: {
        id: episodeId,
      },
    });

    if (!episode) {
      throw new NotFoundException('Episode not found');
    }

    const episodeReviews = await this.prisma.episodeReview.findMany({
      skip: (page - 1) * perPage,
      take: perPage,
      where: {
        episodeId,
      },
      orderBy: {
        reviewAt: 'desc',
      },
    });
    return episodeReviews;
  }
}
