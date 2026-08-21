import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateEpisodeRequest } from '../controllers/schemas/request/update-episode.request.schema';

@Injectable()
export class UpdateEpisodeService {
  constructor(private prisma: PrismaService) {}

  async updateEpisode(id: string, data: UpdateEpisodeRequest) {
    const { count } = await this.prisma.episode.updateMany({
      where: { id },
      data,
    });

    if (count === 0) {
      return null;
    }

    return this.prisma.episode.findUnique({
      where: { id },
    });
  }
}
