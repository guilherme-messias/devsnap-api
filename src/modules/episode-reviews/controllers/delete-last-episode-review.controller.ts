import {
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ZodValidationPipe } from '@src/shared/pipes/ZodValidationPipe';
import { DeleteLastEpisodeReviewService } from '../services/delete-last-episode-review.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { EpisodeReviewOrEpisodeNotFoundErrorResponseDto } from '@src/shared/http/schemas/response/episode-review-or-episode-not-found-error.response.schema';
import { ValidationErrorResponseDto } from '@src/shared/http/schemas/response/validation-error.response.schema';
import { JwtUnauthorizedErrorResponseDto } from '@src/shared/http/schemas/response/jwt-unauthorized-error.response.schema';
import {
  uuidParamSchema,
  type UuidParam,
} from '@src/shared/http/schemas/request/uuid-param.schema';
import { CurrentUserId } from '@src/shared/http/decorators/current-user-id.decorator';

const paramValidationPipe = new ZodValidationPipe(uuidParamSchema);
@ApiTags('episode-reviews')
@Controller('/episodes')
@UseGuards(AuthGuard('jwt'))
export class DeleteLastEpisodeReviewController {
  constructor(
    private readonly deleteLastEpisodeReviewService: DeleteLastEpisodeReviewService,
  ) {}

  @Delete(':episodeId/reviews/latest')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete the last episode review',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'episodeId',
    description: 'Episode ID',
    required: true,
    format: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: 'The last episode review has been deleted',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid episode ID',
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
  async deleteLastEpisodeReview(
    @Param('episodeId', paramValidationPipe)
    episodeId: UuidParam,
    @CurrentUserId() userId: string,
  ) {
    const deletedEpisodeReview =
      await this.deleteLastEpisodeReviewService.deleteLastEpisodeReview(
        episodeId,
        userId,
      );

    if (!deletedEpisodeReview) {
      throw new NotFoundException('Episode review or episode not found');
    }

    return;
  }
}
