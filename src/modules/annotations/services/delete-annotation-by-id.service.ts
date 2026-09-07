import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';

@Injectable()
export class DeleteAnnotationByIdService {
  constructor(private readonly prisma: PrismaService) {}

  async deleteAnnotationById(id: string, episodeId: string, userId: string) {
    const annotation = await this.prisma.annotation.findFirst({
      where: {
        id,
        episodeId,
        episode: { stack: { userId } },
      },
    });

    if (!annotation) {
      return null;
    }

    const deletedAnnotation = await this.prisma.annotation.delete({
      where: { id },
    });

    return deletedAnnotation;
  }
}
