import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';

@Injectable()
export class CreateEpisodeReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async createEpisodeReview(
    episodeId: string,
    result: string,
    userId: string,
    focusSessionId?: string,
  ) {
    const episode = await this.prisma.episode.findFirst({
      where: { id: episodeId, stack: { userId } },
    });

    if (!episode) {
      return null;
    }

    if (focusSessionId) {
      const focusSession = await this.prisma.focusSession.findFirst({
        where: { id: focusSessionId, stack: { userId } },
      });

      if (!focusSession) {
        return { focusSessionNotFound: true as const };
      }
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
