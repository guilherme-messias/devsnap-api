import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { CacheRepository } from '@infrastructure/cache/cache-repository';
import { CacheKeys } from '@infrastructure/cache/cache-keys';

@Injectable()
export class DeleteLastEpisodeReviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheRepository,
  ) {}

  async deleteLastEpisodeReview(episodeId: string, userId: string) {
    const lastEpisodeReview = await this.prisma.episodeReview.findFirst({
      where: { episodeId, episode: { stack: { userId } } },
      orderBy: { reviewAt: 'desc' },
    });

    if (!lastEpisodeReview) {
      return null;
    }

    const deletedEpisodeReview = await this.prisma.episodeReview.delete({
      where: { id: lastEpisodeReview.id },
    });

    await this.cache.delete(CacheKeys.dashboard(userId));

    return deletedEpisodeReview;
  }
}
