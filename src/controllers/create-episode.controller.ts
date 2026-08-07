import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateEpisodeRequest } from './episode.type';

@Controller('/episodes')
export class CreateEpisodeController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
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
