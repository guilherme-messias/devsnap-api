import {
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
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
import { FetchRecentEpisodeReviewsService } from '../services/fetch-recent-episode-reviews.service';
import { FetchRecentEpisodeReviewsResponseDto } from '../schemas/response/fetch-recent-episode-reviews.response.schema';
import {
  pageQueryParamsSchema,
  type PageQueryParams,
} from '@src/shared/http/schemas/request/page-query.schema';
import {
  uuidParamSchema,
  type UuidParam,
} from '@src/shared/http/schemas/request/uuid-param.schema';

const queryValidationPipe = new ZodValidationPipe(pageQueryParamsSchema);
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
    @Param('episodeId', new ZodValidationPipe(uuidParamSchema))
    episodeId: UuidParam,
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

    if (!episodeReviews) {
      throw new NotFoundException('Episode not found');
    }

    return { episodeReviews };
  }
}
