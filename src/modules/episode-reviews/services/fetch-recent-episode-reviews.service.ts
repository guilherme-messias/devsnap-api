import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { PaginationParams } from '@shared/http/schemas/request/page-query.schema';

@Injectable()
export class FetchRecentEpisodeReviewsService {
  constructor(private prisma: PrismaService) {}

  async fetchRecentEpisodeReviews(
    data: PaginationParams,
    episodeId: string,
    userId: string,
  ) {
    const { page, perPage } = data;

    const episode = await this.prisma.episode.findFirst({
      where: {
        id: episodeId,
        stack: { userId },
      },
    });

    if (!episode) {
      return null;
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
