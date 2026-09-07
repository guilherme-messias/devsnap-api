import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { UpdateEpisodeDto } from '../schemas/request/update-episode.request.schema';

@Injectable()
export class UpdateEpisodeService {
  constructor(private prisma: PrismaService) {}

  async updateEpisode(id: string, data: UpdateEpisodeDto, userId: string) {
    if (data.stackId) {
      const targetStack = await this.prisma.stack.findFirst({
        where: { id: data.stackId, userId },
      });

      if (!targetStack) {
        return null;
      }
    }

    const { count } = await this.prisma.episode.updateMany({
      where: { id, stack: { userId } },
      data,
    });

    if (count === 0) {
      return null;
    }

    return this.prisma.episode.findFirst({
      where: { id, stack: { userId } },
      include: { stack: true, annotations: true },
    });
  }
}
