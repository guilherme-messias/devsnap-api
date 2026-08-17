import { Controller, HttpCode, Get, Query } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import z from 'zod';
import { ZodValidationPipe } from '../../pipes/ZodValidationPipe';

const pageQueryParamsSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().int().min(1));

const queryValidationPipe = new ZodValidationPipe(pageQueryParamsSchema);
type PageQueryParams = z.infer<typeof pageQueryParamsSchema>;
@Controller('/episodes')
export class FetchRecentEpisodesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @HttpCode(200)
  async fetchRecentEpisodes(
    @Query('page', queryValidationPipe) page: PageQueryParams,
  ) {
    const perPage = 1;

    const episodes = await this.prisma.episode.findMany({
      take: perPage,
      skip: (page - 1) * perPage,
      orderBy: {
        created_at: 'desc',
      },
    });

    return { episodes };
  }
}
