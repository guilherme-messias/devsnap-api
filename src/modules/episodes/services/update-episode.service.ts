import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { UpdateEpisodeDto } from '../schemas/request/update-episode.request.schema';
import { CacheRepository } from '@infrastructure/cache/cache-repository';
import { CacheKeys } from '@infrastructure/cache/cache-keys';

@Injectable()
export class UpdateEpisodeService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheRepository,
  ) {}

  async updateEpisode(id: string, data: UpdateEpisodeDto, userId: string) {
    if (data.stackId) {
      const targetStack = await this.prisma.stack.findFirst({
        where: { id: data.stackId, userId },
      });

      if (!targetStack) {
        return { stackNotFound: true as const };
      }
    }

    const { count } = await this.prisma.episode.updateMany({
      where: { id, stack: { userId } },
      data,
    });

    if (count === 0) {
      return null;
    }

    await this.cache.delete(CacheKeys.dashboard(userId));

    return this.prisma.episode.findFirst({
      where: { id, stack: { userId } },
      include: { stack: true, annotations: true },
    });
  }
}
