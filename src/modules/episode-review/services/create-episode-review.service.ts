import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';

@Injectable()
export class CreateEpisodeReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async createEpisodeReview(
    episodeId: string,
    result: string,
    focusSessionId?: string,
  ) {
    return this.prisma.episodeReview.create({
      data: {
        episodeId,
        result,
        focusSessionId,
      },
    });
  }
}
