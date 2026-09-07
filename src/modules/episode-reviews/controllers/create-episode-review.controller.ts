import {
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Req,
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
import { ValidationErrorResponseDto } from '@http/schemas/response/validation-error.response.schema';
import { JwtUnauthorizedErrorResponseDto } from '@http/schemas/response/jwt-unauthorized-error.response.schema';
import { CreateEpisodeReviewResponseDto } from '../schemas/response/create-episode-review.response.schema';
import { EpisodeNotFoundErrorResponseDto } from '@http/schemas/response/episode-not-found-error.response.schema';
import { FocusSessionNotFoundErrorResponseDto } from '@http/schemas/response/focus-session-not-found-error.response.schema';
import { ZodValidationPipe } from '@shared/pipes/ZodValidationPipe';
import {
  uuidParamSchema,
  type UuidParam,
} from '@http/schemas/request/uuid-param.schema';
import type { RequestWithUser } from '@http/types/request-with-user';

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
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;

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
