import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';

@Injectable()
export class DeleteLastEpisodeReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async deleteLastEpisodeReview(episodeId: string) {
    const lastEpisodeReview = await this.prisma.episodeReview.findFirst({
      where: { episodeId },
      orderBy: { reviewAt: 'desc' },
    });

    if (!lastEpisodeReview) {
      return null;
    }

    return this.prisma.episodeReview.delete({
      where: { id: lastEpisodeReview.id },
    });
  }
}
