import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAnnotationDto } from '../controllers/schemas/request/create-annotation.request.schema';

@Injectable()
export class CreateAnnotationService {
  constructor(private readonly prisma: PrismaService) {}

  async createAnnotation(data: CreateAnnotationDto, episodeId: string) {
    const { text } = data;

    const episode = await this.prisma.episode.findUnique({
      where: {
        id: episodeId,
      },
    });

    if (!episode) {
      throw new NotFoundException('Episode not found');
    }

    const annotation = await this.prisma.annotation.create({
      data: {
        text,
        episodeId,
      },
    });

    return annotation;
  }
}
