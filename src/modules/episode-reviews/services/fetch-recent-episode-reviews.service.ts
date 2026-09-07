import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { PaginationParams } from '@shared/http/schemas/request/page-query.schema';

@Injectable()
export class FetchRecentEpisodeReviewsService {
  constructor(private prisma: PrismaService) {}

  async fetchRecentEpisodeReviews(data: PaginationParams, episodeId: string) {
    const { page, perPage } = data;

    const episode = await this.prisma.episode.findUnique({
      where: {
        id: episodeId,
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
