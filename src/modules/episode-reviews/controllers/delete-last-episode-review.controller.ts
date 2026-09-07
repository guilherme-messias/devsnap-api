import {
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ZodValidationPipe } from '@shared/pipes/ZodValidationPipe';
import { DeleteLastEpisodeReviewService } from '../services/delete-last-episode-review.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { EpisodeReviewOrEpisodeNotFoundErrorResponseDto } from '@http/schemas/response/episode-review-or-episode-not-found-error.response.schema';
import { ValidationErrorResponseDto } from '@http/schemas/response/validation-error.response.schema';
import { JwtUnauthorizedErrorResponseDto } from '@http/schemas/response/jwt-unauthorized-error.response.schema';
import {
  uuidParamSchema,
  type UuidParam,
} from '@http/schemas/request/uuid-param.schema';
import type { RequestWithUser } from '@http/types/request-with-user';

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
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;

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
