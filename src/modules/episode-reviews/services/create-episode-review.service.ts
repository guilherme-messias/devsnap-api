import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';

@Injectable()
export class CreateEpisodeReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async createEpisodeReview(
    episodeId: string,
    result: string,
    focusSessionId?: string,
  ) {
    const episode = await this.prisma.episode.findUnique({
      where: { id: episodeId },
    });

    if (!episode) {
      return null;
    }

    return this.prisma.episodeReview.create({
      data: {
        episodeId,
        result,
        focusSessionId,
      },
    });
  }
}
