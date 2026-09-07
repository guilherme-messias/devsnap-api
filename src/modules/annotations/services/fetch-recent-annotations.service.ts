import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { PaginationParams } from '@shared/http/schemas/request/page-query.schema';

@Injectable()
export class FetchRecentAnnotationsService {
  constructor(private prisma: PrismaService) {}

  async fetchRecentAnnotations(data: PaginationParams, episodeId: string) {
    const { page, perPage } = data;

    const episode = await this.prisma.episode.findUnique({
      where: {
        id: episodeId,
      },
    });

    if (!episode) {
      throw new NotFoundException('Episode not found');
    }

    const annotations = await this.prisma.annotation.findMany({
      skip: (page - 1) * perPage,
      take: perPage,
      where: {
        episodeId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return annotations;
  }
}
