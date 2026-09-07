import {
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Req,
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
import { ValidationErrorResponseDto } from '@http/schemas/response/validation-error.response.schema';
import { JwtUnauthorizedErrorResponseDto } from '@http/schemas/response/jwt-unauthorized-error.response.schema';
import { ZodValidationPipe } from '@shared/pipes/ZodValidationPipe';
import { FetchEpisodeReviewByIdService } from '../services/fetch-episode-review-by-id.service';
import { FetchEpisodeReviewResponseDto } from '../schemas/response/fetch-episode-review.response.schema';
import { EpisodeReviewOrEpisodeNotFoundErrorResponseDto } from '@http/schemas/response/episode-review-or-episode-not-found-error.response.schema';
import {
  uuidParamSchema,
  type UuidParam,
} from '@http/schemas/request/uuid-param.schema';
import type { RequestWithUser } from '@http/types/request-with-user';

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
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;

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
