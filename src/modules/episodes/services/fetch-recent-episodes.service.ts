import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { PaginationParams } from '@shared/http/schemas/request/page-query.schema';

@Injectable()
export class FetchRecentEpisodesService {
  constructor(private prisma: PrismaService) {}

  async fetchRecentEpisodes(data: PaginationParams) {
    const { page, perPage } = data;

    const episodes = await this.prisma.episode.findMany({
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: {
        createdAt: 'desc',
      },
      include: { stack: true, annotations: true },
    });

    return episodes;
  }
}
