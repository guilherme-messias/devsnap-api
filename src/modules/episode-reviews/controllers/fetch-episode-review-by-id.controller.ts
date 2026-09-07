import {
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ValidationErrorResponseDto } from '@src/shared/http/schemas/response/validation-error.response.schema';
import { JwtUnauthorizedErrorResponseDto } from '@src/shared/http/schemas/response/jwt-unauthorized-error.response.schema';
import { ZodValidationPipe } from '@src/shared/pipes/ZodValidationPipe';
import { FetchEpisodeReviewByIdService } from '../services/fetch-episode-review-by-id.service';
import { FetchEpisodeReviewResponseDto } from '../schemas/response/fetch-episode-review.response.schema';
import { EpisodeReviewOrEpisodeNotFoundErrorResponseDto } from '@src/shared/http/schemas/response/episode-review-or-episode-not-found-error.response.schema';
import {
  uuidParamSchema,
  type UuidParam,
} from '@src/shared/http/schemas/request/uuid-param.schema';
import { CurrentUserId } from '@src/shared/http/decorators/current-user-id.decorator';

@ApiTags('episode-reviews')
@Controller('/episodes')
@UseGuards(AuthGuard('jwt'))
export class FetchEpisodeReviewByIdController {
  constructor(
    private readonly fetchEpisodeReviewByIdService: FetchEpisodeReviewByIdService,
  ) {}

  @Get(':episodeId/reviews/:id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Fetch an episode review by ID' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'episodeId',
    description: 'Episode ID',
    required: true,
    format: 'uuid',
  })
  @ApiParam({
    name: 'id',
    description: 'Episode review ID',
    required: true,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'The episode review has been successfully fetched.',
    type: FetchEpisodeReviewResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ID parameter',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Missing, invalid, or expired token',
    type: JwtUnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Episode review or episode not found',
    type: EpisodeReviewOrEpisodeNotFoundErrorResponseDto,
  })
  async fetchEpisodeReviewById(
    @Param('episodeId', new ZodValidationPipe(uuidParamSchema))
    episodeId: UuidParam,
    @Param('id', new ZodValidationPipe(uuidParamSchema)) id: UuidParam,
    @CurrentUserId() userId: string,
  ) {
    const episodeReview =
      await this.fetchEpisodeReviewByIdService.fetchEpisodeReviewById(
        id,
        episodeId,
        userId,
      );

    if (!episodeReview) {
      throw new NotFoundException(`Episode review or episode not found`);
    }

    return { episodeReview };
  }
}
