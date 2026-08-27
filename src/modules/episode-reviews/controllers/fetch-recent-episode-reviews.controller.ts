import { Controller, Get, HttpCode, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { EpisodeNotFoundErrorResponseDto } from '@src/shared/http/schemas/response/episode-not-found-error.response.schema';
import { ValidationErrorResponseDto } from '@src/shared/http/schemas/response/validation-error.response.schema';
import { ZodValidationPipe } from '@src/shared/pipes/ZodValidationPipe';
import z from 'zod';
import { FetchRecentEpisodeReviewsService } from '../services/fetch-recent-episode-reviews.service';
import { FetchRecentEpisodeReviewsResponseDto } from './schemas/response/fetch-recent-episode-reviews.response.schema';

const pageQueryParamsSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().int().min(1));

const queryValidationPipe = new ZodValidationPipe(pageQueryParamsSchema);
type PageQueryParams = z.infer<typeof pageQueryParamsSchema>;

const episodeIdSchema = z.uuid();
type EpisodeId = z.infer<typeof episodeIdSchema>;

@ApiTags('episode-reviews')
@Controller('/episodes')
export class FetchRecentEpisodeReviewsController {
  constructor(
    private readonly fetchRecentEpisodeReviewsService: FetchRecentEpisodeReviewsService,
  ) {}

  @Get(':episodeId/reviews')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Fetch recent episode reviews',
  })
  @ApiParam({
    name: 'episodeId',
    description: 'The ID of the episode',
    required: true,
    format: 'uuid',
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
      'Returns recent episode reviews. The episode reviews array is empty when no episode reviews are found.',
    type: FetchRecentEpisodeReviewsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Episode not found',
    type: EpisodeNotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid page parameter or episode ID',
    type: ValidationErrorResponseDto,
  })
  async fetchRecentEpisodeReviews(
    @Query('page', queryValidationPipe) page: PageQueryParams,
    @Param('episodeId', new ZodValidationPipe(episodeIdSchema))
    episodeId: EpisodeId,
  ) {
    const perPage = 1;

    const episodeReviews =
      await this.fetchRecentEpisodeReviewsService.fetchRecentEpisodeReviews(
        {
          page,
          perPage,
        },
        episodeId,
      );

    return { episodeReviews };
  }
}
