import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { UpdateEpisodeDto } from '../controllers/schemas/request/update-episode.request.schema';

@Injectable()
export class UpdateEpisodeService {
  constructor(private prisma: PrismaService) {}

  async updateEpisode(id: string, data: UpdateEpisodeDto) {
    const { count } = await this.prisma.episode.updateMany({
      where: { id },
      data,
    });

    if (count === 0) {
      return null;
    }

    return this.prisma.episode.findUnique({
      where: { id },
      include: { stack: true, annotations: true },
    });
  }
}
