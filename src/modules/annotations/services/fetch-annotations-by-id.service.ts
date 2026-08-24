import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';

@Injectable()
export class FetchAnnotationsByIdService {
  constructor(private readonly prisma: PrismaService) {}

  async fetchAnnotationsById(id: string, episodeId: string) {
    const annotation = await this.prisma.annotation.findUnique({
      where: { id },
    });

    if (!annotation || annotation.episodeId !== episodeId) {
      return null;
    }

    return annotation;
  }
}
