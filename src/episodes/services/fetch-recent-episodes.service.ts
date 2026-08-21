import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FetchRecentEpisodesService {
  constructor(private prisma: PrismaService) {}

  async fetchRecentEpisodes(data: { page: number; perPage: number }) {
    const { page, perPage } = data;

    const episodes = await this.prisma.episode.findMany({
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return episodes;
  }
}
