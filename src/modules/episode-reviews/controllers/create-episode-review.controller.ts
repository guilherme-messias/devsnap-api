import {
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateEpisodeReviewService } from '../services/create-episode-review.service';
import {
  CreateEpisodeReviewDto,
  createEpisodeReviewSchema,
} from '../schemas/request/create-episode-review.request.schema';
import { ValidationErrorResponseDto } from '@src/shared/http/schemas/response/validation-error.response.schema';
import { JwtUnauthorizedErrorResponseDto } from '@src/shared/http/schemas/response/jwt-unauthorized-error.response.schema';
import { CreateEpisodeReviewResponseDto } from '../schemas/response/create-episode-review.response.schema';
import { EpisodeNotFoundErrorResponseDto } from '@src/shared/http/schemas/response/episode-not-found-error.response.schema';
import { FocusSessionNotFoundErrorResponseDto } from '@src/shared/http/schemas/response/focus-session-not-found-error.response.schema';
import { ZodValidationPipe } from '@src/shared/pipes/ZodValidationPipe';
import {
  uuidParamSchema,
  type UuidParam,
} from '@src/shared/http/schemas/request/uuid-param.schema';
import { CurrentUserId } from '@src/shared/http/decorators/current-user-id.decorator';

@ApiTags('episode-reviews')
@Controller('/episodes')
@UseGuards(AuthGuard('jwt'))
export class CreateEpisodeReviewController {
  constructor(
    private readonly createEpisodeReviewService: CreateEpisodeReviewService,
  ) {}

  @Post(':episodeId/reviews')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create an episode review' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'episodeId',
    description: 'Episode ID',
    required: true,
    format: 'uuid',
  })
  @ApiResponse({
    status: 201,
    description: 'The episode review has been successfully created.',
    type: CreateEpisodeReviewResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body or ID parameter',
    type: ValidationErrorResponseDto,
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
    status: 404,
    description: 'Focus session not found',
    type: FocusSessionNotFoundErrorResponseDto,
  })
  async createEpisodeReview(
    @Param('episodeId', new ZodValidationPipe(uuidParamSchema))
    episodeId: UuidParam,
    @Body(new ZodValidationPipe(createEpisodeReviewSchema))
    body: CreateEpisodeReviewDto,
    @CurrentUserId() userId: string,
  ) {
    const { result, focusSessionId } = body;

    const episodeReview =
      await this.createEpisodeReviewService.createEpisodeReview(
        episodeId,
        result,
        userId,
        focusSessionId ?? undefined,
      );

    if (!episodeReview) {
      throw new NotFoundException('Episode not found');
    }

    if ('focusSessionNotFound' in episodeReview) {
      throw new NotFoundException('Focus session not found');
    }

    return episodeReview;
  }
}
