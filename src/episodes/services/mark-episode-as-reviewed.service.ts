import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MarkEpisodeAsReviewedService {
  constructor(private prisma: PrismaService) {}
  async markEpisodeAsReviewed(id: string, reviewed: boolean) {
    const { count } = await this.prisma.episode.updateMany({
      where: { id },
      data: { reviewed },
    });
    if (count === 0) {
      return null;
    }

    return this.prisma.episode.findUnique({
      where: { id },
      include: { stack: true },
    });
  }
}
