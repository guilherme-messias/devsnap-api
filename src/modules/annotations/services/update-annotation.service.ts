import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';
import { UpdateAnnotationDto } from '../controllers/schemas/request/update-annotation.request.schema';

@Injectable()
export class UpdateAnnotationService {
  constructor(private prisma: PrismaService) {}

  async updateAnnotation(
    id: string,
    data: UpdateAnnotationDto,
    episodeId: string,
  ) {
    const { count } = await this.prisma.annotation.updateMany({
      where: { id, episodeId },
      data,
    });

    if (count === 0) {
      return null;
    }
    
    return this.prisma.annotation.findUnique({
      where: { id },
    });
  }
}
