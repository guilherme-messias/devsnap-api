import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { CacheRepository } from '@infrastructure/cache/cache-repository';
import { CacheKeys } from '@infrastructure/cache/cache-leys';

@Injectable()
export class DeleteEpisodeByIdService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheRepository,
  ) {}

  async deleteEpisodeById(id: string, userId: string) {
    const episode = await this.prisma.episode.findFirst({
      where: { id, stack: { userId } },
    });

    if (!episode) {
      return null;
    }

    const deletedEpisode = await this.prisma.episode.delete({
      where: { id },
    });

    this.cache.delete(CacheKeys.dashboard(userId));

    return deletedEpisode;
  }
}
