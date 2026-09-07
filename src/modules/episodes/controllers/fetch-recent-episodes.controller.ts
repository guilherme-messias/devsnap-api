import {
  Controller,
  HttpCode,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ZodValidationPipe } from '@shared/pipes/ZodValidationPipe';
import { FetchRecentEpisodesService } from '../services/fetch-recent-episodes.service';
import {
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ValidationErrorResponseDto } from '@shared/http/schemas/response/validation-error.response.schema';
import { JwtUnauthorizedErrorResponseDto } from '@shared/http/schemas/response/jwt-unauthorized-error.response.schema';
import { FetchRecentEpisodesResponseDto } from '../schemas/response/fetch-recent-episodes.response.schema';
import {
  pageQueryParamsSchema,
  type PageQueryParams,
} from '@shared/http/schemas/request/page-query.schema';
import type { RequestWithUser } from '@shared/http/types/request-with-user';

const queryValidationPipe = new ZodValidationPipe(pageQueryParamsSchema);
@ApiTags('episodes')
@Controller('/episodes')
@UseGuards(AuthGuard('jwt'))
export class FetchRecentEpisodesController {
  constructor(
    private readonly fetchRecentEpisodesService: FetchRecentEpisodesService,
  ) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Fetch recent episodes',
  })
  @ApiBearerAuth()
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
  @ApiResponse({
    status: 401,
    description: 'Missing, invalid, or expired token',
    type: JwtUnauthorizedErrorResponseDto,
  })
  async fetchRecentEpisodes(
    @Query('page', queryValidationPipe) page: PageQueryParams,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;

    const perPage = 1;

    const episodes = await this.fetchRecentEpisodesService.fetchRecentEpisodes(
      {
        page,
        perPage,
      },
      userId,
    );

    return { episodes };
  }
}
