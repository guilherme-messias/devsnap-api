import { Body, Controller, HttpCode, Post, UsePipes } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createEpisodeSchema, type CreateEpisodeRequest } from './episode.type';
import { ZodValidationPipe } from '../pipes/ZodValidationPipe';

@Controller('/episodes')
export class CreateEpisodeController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createEpisodeSchema))
  async createEpisode(@Body() body: CreateEpisodeRequest) {
    const { title, stack, error, solution } = body;

    const episode = await this.prisma.episode.create({
      data: {
        title,
        stack,
        error,
        solution,
      },
    });

    return episode;
  }
}
