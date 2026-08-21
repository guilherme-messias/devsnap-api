import { Controller, HttpCode, Get, Query } from '@nestjs/common';
import z from 'zod';
import { ZodValidationPipe } from '../../pipes/ZodValidationPipe';
import { FetchRecentEpisodesService } from '../services/fetch-recent-episodes.service';
import { ApiQuery, ApiResponse } from '@nestjs/swagger';

const pageQueryParamsSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().int().min(1));

const queryValidationPipe = new ZodValidationPipe(pageQueryParamsSchema);
type PageQueryParams = z.infer<typeof pageQueryParamsSchema>;

// @ApiTags('episodes')
@Controller('/episodes')
export class FetchRecentEpisodesController {
  constructor(
    private readonly fetchRecentEpisodesService: FetchRecentEpisodesService,
  ) {}

  @Get()
  @HttpCode(200)
  //       @ApiOperation({
  //         summary: 'Fetch recent episodes',
  //       })

  //     @ApiQuery({
  //       name: 'page',
  //       description: 'Page number for pagination (default: 1)',
  //       required: false,
  //       schema: {
  //         type: 'integer',
  //         default: 1,
  //         minimum: 1,
  //       },

  //     })
  //     @ApiResponse({
  //       status: 200,
  //       description: 'The recent episodes have been successfully fetched.',
  //       type: [FetchEpisodeResponseDto],
  //     })
  //     @ApiResponse({
  //       status: 400,
  //       description: 'Invalid page parameter',
  //       type: ValidationErrorResponseDto,
  //     })
  //     @ApiResponse({
  //       status: 404,
  //       description: 'Episodes not found',
  //       type: NotFoundErrorResponseDto,
  //     })
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
