import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FetchEpisodeByIdService {
  constructor(private prisma: PrismaService) {}

  async fetchEpisodeById(id: string) {
    const episode = await this.prisma.episode.findUnique({
      where: { id },
    });

    return episode;
  }
}
