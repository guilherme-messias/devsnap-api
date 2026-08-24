import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';

@Injectable()
export class DeleteAnnotationsByIdService {
  constructor(private readonly prisma: PrismaService) {}

  async deleteAnnotationsById(id: string, episodeId: string) {
    const annotation = await this.prisma.annotation.findUnique({
      where: { id },
    });

    if (!annotation || annotation.episodeId !== episodeId) {
      return null;
    }

    const deletedAnnotation = await this.prisma.annotation.delete({
      where: { id },
    });

    return deletedAnnotation;
  }
}
