import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';

@Injectable()
export class FetchAnnotationByIdService {
  constructor(private readonly prisma: PrismaService) {}

  async fetchAnnotationById(id: string, episodeId: string, userId: string) {
    const annotation = await this.prisma.annotation.findFirst({
      where: {
        id,
        episodeId,
        episode: { stack: { userId } },
      },
    });

    return annotation;
  }
}
