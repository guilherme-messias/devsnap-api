import {
  Controller,
  Get,
  HttpCode,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { EpisodeNotFoundErrorResponseDto } from '@src/shared/http/schemas/response/episode-not-found-error.response.schema';
import { ValidationErrorResponseDto } from '@src/shared/http/schemas/response/validation-error.response.schema';
import { JwtUnauthorizedErrorResponseDto } from '@src/shared/http/schemas/response/jwt-unauthorized-error.response.schema';
import { ZodValidationPipe } from '@src/shared/pipes/ZodValidationPipe';
import { FetchRecentAnnotationsService } from '../services/fetch-recent-annotations.service';
import { FetchRecentAnnotationsResponseDto } from '../schemas/response/fetch-recent-annotations.response.schema';
import {
  pageQueryParamsSchema,
  type PageQueryParams,
} from '@src/shared/http/schemas/request/page-query.schema';
import {
  uuidParamSchema,
  type UuidParam,
} from '@src/shared/http/schemas/request/uuid-param.schema';
import { CurrentUserId } from '@src/shared/http/decorators/current-user-id.decorator';

const queryValidationPipe = new ZodValidationPipe(pageQueryParamsSchema);
@ApiTags('annotations')
@Controller('/episodes')
@UseGuards(AuthGuard('jwt'))
export class FetchRecentAnnotationsController {
  constructor(
    private readonly fetchRecentAnnotationsService: FetchRecentAnnotationsService,
  ) {}

  @Get(':episodeId/annotations')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Fetch recent annotations',
  })
  @ApiBearerAuth()
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
      'Returns recent annotations. The annotations array is empty when no annotations are found.',
    type: FetchRecentAnnotationsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Missing, invalid, or expired token',
    type: JwtUnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Episode not found',
    type: EpisodeNotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid page parameter',
    type: ValidationErrorResponseDto,
  })
  async fetchRecentAnnotations(
    @Query('page', queryValidationPipe) page: PageQueryParams,
    @Param('episodeId', new ZodValidationPipe(uuidParamSchema))
    episodeId: UuidParam,
    @CurrentUserId() userId: string,
  ) {
    const perPage = 1;

    const annotations =
      await this.fetchRecentAnnotationsService.fetchRecentAnnotations(
        {
          page,
          perPage,
        },
        episodeId,
        userId,
      );

    return { annotations };
  }
}
