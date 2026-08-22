import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEpisodeDto } from '../controllers/schemas/request/create-episode.request.schema';

@Injectable()
export class CreateEpisodeService {
  constructor(private prisma: PrismaService) {}

  async createEpisode(data: CreateEpisodeDto) {
    const { title, stackId, error, solution } = data;

    const episode = await this.prisma.episode.create({
      data: {
        title,
        stackId,
        error,
        solution,
      },
      include: { stack: true, annotations: true },
    });

    return episode;
  }
}
