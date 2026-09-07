import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';
import { UpdateAnnotationDto } from '../schemas/request/update-annotation.request.schema';

@Injectable()
export class UpdateAnnotationService {
  constructor(private prisma: PrismaService) {}

  async updateAnnotation(
    id: string,
    data: UpdateAnnotationDto,
    episodeId: string,
    userId: string,
  ) {
    const where = {
      id,
      episodeId,
      episode: { stack: { userId } },
    };

    const { count } = await this.prisma.annotation.updateMany({
      where,
      data,
    });

    if (count === 0) {
      return null;
    }

    return this.prisma.annotation.findFirst({ where });
  }
}
