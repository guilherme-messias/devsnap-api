import {
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ValidationErrorResponseDto } from '@src/shared/http/schemas/response/validation-error.response.schema';
import { ZodValidationPipe } from '@src/shared/pipes/ZodValidationPipe';
import z from 'zod';
import { FetchEpisodeReviewByIdService } from '../services/fetch-episode-review-by-id.service';
import { FetchEpisodeReviewResponseDto } from './schemas/response/fetch-episode-review.response.schema';
import { EpisodeReviewOrEpisodeNotFoundErrorResponseDto } from '@src/shared/http/schemas/response/episode-review-or-episode-not-found-error.response.schema';

const episodeIdSchema = z.uuid();
type EpisodeId = z.infer<typeof episodeIdSchema>;

const idSchema = z.uuid();
type Id = z.infer<typeof idSchema>;

@ApiTags('episode-reviews')
@Controller('/episodes')
export class FetchEpisodeReviewByIdController {
  constructor(
    private readonly fetchEpisodeReviewByIdService: FetchEpisodeReviewByIdService,
  ) {}

  @Get(':episodeId/reviews/:id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Fetch an episode review by ID' })
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
    status: 404,
    description: 'Episode review or episode not found',
    type: EpisodeReviewOrEpisodeNotFoundErrorResponseDto,
  })
  async fetchEpisodeReviewById(
    @Param('episodeId', new ZodValidationPipe(episodeIdSchema))
    episodeId: EpisodeId,
    @Param('id', new ZodValidationPipe(idSchema)) id: Id,
  ) {
    const episodeReview =
      await this.fetchEpisodeReviewByIdService.fetchEpisodeReviewById(
        id,
        episodeId,
      );

    if (!episodeReview) {
      throw new NotFoundException(`Episode review or episode not found`);
    }

    return { episodeReview };
  }
}
