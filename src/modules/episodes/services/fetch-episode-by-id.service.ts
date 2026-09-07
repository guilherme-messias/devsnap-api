import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';

@Injectable()
export class FetchEpisodeByIdService {
  constructor(private prisma: PrismaService) {}

  async fetchEpisodeById(id: string, userId: string) {
    const episode = await this.prisma.episode.findFirst({
      where: { id, stack: { userId } },
      include: { stack: true, annotations: true },
    });

    return episode;
  }
}
