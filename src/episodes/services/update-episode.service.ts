import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateEpisodeRequest } from '../controllers/schemas/episode.type';

@Injectable()
export class UpdateEpisodeService {
  constructor(private prisma: PrismaService) {}
  async updateEpisode(id: string, data: UpdateEpisodeRequest) {
    const { title, stack, error, solution } = data;

    const episode = await this.prisma.episode.update({
      where: { id },
      data: {
        title,
        stack,
        error,
        solution,
      },
    });

    return episode;
  }
}
