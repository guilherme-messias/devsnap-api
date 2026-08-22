import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateAnnotationsDto } from '../controllers/request/create-annotations.request';

@Injectable()
export class CreateAnnotationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createAnnotations(data: CreateAnnotationsDto, episodeId: string) {
    const { text } = data;

    const annotation = await this.prisma.annotation.create({
      data: {
        text,
        episodeId,
      },
    });

    return annotation;
  }
}
