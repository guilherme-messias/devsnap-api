import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { CacheRepository } from '@infrastructure/cache/cache-repository';
import { CacheKeys } from '@infrastructure/cache/cache-leys';

@Injectable()
export class CreateEpisodeReviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheRepository,
  ) {}

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

    this.cache.delete(CacheKeys.dashboard(userId));

    return this.prisma.episodeReview.create({
      data: {
        episodeId,
        result,
        focusSessionId,
      },
    });
  }
}
