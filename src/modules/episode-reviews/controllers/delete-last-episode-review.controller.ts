import {
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { ZodValidationPipe } from '@src/shared/pipes/ZodValidationPipe';
import z from 'zod';
import { DeleteLastEpisodeReviewService } from '../services/delete-last-episode-review.service';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EpisodeReviewOrEpisodeNotFoundErrorResponseDto } from '@src/shared/http/schemas/response/episode-review-or-episode-not-found-error.response.schema';
import { ValidationErrorResponseDto } from '@src/shared/http/schemas/response/validation-error.response.schema';

const episodeIdSchema = z.uuid();

const paramValidationPipe = new ZodValidationPipe(episodeIdSchema);
type EpisodeId = z.infer<typeof episodeIdSchema>;

@ApiTags('episode-reviews')
@Controller('/episodes')
export class DeleteLastEpisodeReviewController {
  constructor(
    private readonly deleteLastEpisodeReviewService: DeleteLastEpisodeReviewService,
  ) {}

  @Delete(':episodeId/reviews/latest')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete the last episode review',
  })
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
    status: 404,
    description: 'Episode review or episode not found',
    type: EpisodeReviewOrEpisodeNotFoundErrorResponseDto,
  })
  async deleteLastEpisodeReview(
    @Param('episodeId', paramValidationPipe)
    episodeId: EpisodeId,
  ) {
    const deletedEpisodeReview =
      await this.deleteLastEpisodeReviewService.deleteLastEpisodeReview(
        episodeId,
      );

    if (!deletedEpisodeReview) {
      throw new NotFoundException('Episode review or episode not found');
    }

    return;
  }
}
