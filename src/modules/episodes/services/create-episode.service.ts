import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { CreateEpisodeDto } from '../schemas/request/create-episode.request.schema';

@Injectable()
export class CreateEpisodeService {
  constructor(private prisma: PrismaService) {}

  async createEpisode(data: CreateEpisodeDto, userId: string) {
    const { title, stackId, error, solution } = data;

    const stack = await this.prisma.stack.findFirst({
      where: { id: stackId, userId },
    });

    if (!stack) {
      return null;
    }

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
