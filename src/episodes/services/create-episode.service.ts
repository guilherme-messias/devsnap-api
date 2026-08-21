import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEpisodeDto } from '../controllers/schemas/episode.type';

@Injectable()
export class CreateEpisodeService {
  constructor(private prisma: PrismaService) {}

  async createEpisode(data: CreateEpisodeDto) {
    const { title, stack, error, solution } = data;

    const episode = await this.prisma.episode.create({
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
