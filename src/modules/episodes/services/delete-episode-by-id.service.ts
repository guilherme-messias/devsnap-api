import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';

@Injectable()
export class DeleteEpisodeByIdService {
  constructor(private prisma: PrismaService) {}

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

    return deletedEpisode;
  }
}
