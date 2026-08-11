import { Body, Controller, HttpCode, Get, UsePipes } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  createEpisodeSchema,
  type CreateEpisodeRequest,
} from './schemas/episode.type';
import { ZodValidationPipe } from '../pipes/ZodValidationPipe';

@Controller('/episodes')
export class FetchRecentEpisodesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @HttpCode(200)
  // @UsePipes(new ZodValidationPipe(createEpisodeSchema))
  async fetchRecentEpisodes() {
    // const { title, stack, error, solution } = body;

    const episodes = await this.prisma.episode.findMany({
      orderBy: {
        created_at: 'desc',
      },
    });

    return episodes;
    // const episode = await this.prisma.episode.create({
    //   data: {
    //     title,
    //     stack,
    //     error,
    //     solution,
    //   },
    // });

    // return episode;
  }
}
