import { Controller, HttpCode, Get, Query } from '@nestjs/common';
import { ZodValidationPipe } from '@shared/pipes/ZodValidationPipe';
import { FetchRecentEpisodesService } from '../services/fetch-recent-episodes.service';
import { ApiQuery, ApiResponse, ApiTags, ApiOperation } from '@nestjs/swagger';
import { ValidationErrorResponseDto } from '@shared/http/schemas/response/validation-error.response.schema';
import { FetchRecentEpisodesResponseDto } from '../schemas/response/fetch-recent-episodes.response.schema';
import {
  pageQueryParamsSchema,
  type PageQueryParams,
} from '@shared/http/schemas/request/page-query.schema';

const queryValidationPipe = new ZodValidationPipe(pageQueryParamsSchema);
@ApiTags('episodes')
@Controller('/episodes')
export class FetchRecentEpisodesController {
  constructor(
    private readonly fetchRecentEpisodesService: FetchRecentEpisodesService,
  ) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Fetch recent episodes',
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number for pagination (default: 1)',
    required: false,
    schema: {
      type: 'integer',
      default: 1,
      minimum: 1,
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns recent episodes. The episodes array is empty when no episodes are found.',
    type: FetchRecentEpisodesResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid page parameter',
    type: ValidationErrorResponseDto,
  })
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
