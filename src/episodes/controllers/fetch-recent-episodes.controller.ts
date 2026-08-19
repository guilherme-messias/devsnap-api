import { Controller, HttpCode, Get, Query } from '@nestjs/common';
import z from 'zod';
import { ZodValidationPipe } from '../../pipes/ZodValidationPipe';
import { FetchRecentEpisodesService } from '../services/fetch-recent-episodes.service';

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
  constructor(
    private readonly fetchRecentEpisodesService: FetchRecentEpisodesService,
  ) {}

  @Get()
  @HttpCode(200)
  async fetchRecentEpisodes(
    @Query('page', queryValidationPipe) page: PageQueryParams,
  ) {
    const perPage = 1;

    const episodes = await this.fetchRecentEpisodesService.fetchRecentEpisodes({
      page,
      perPage,
    });

    return { episodes };
  }
}
