import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateEpisodeReviewService } from '../services/create-episode-review.service';
import { CreateEpisodeReviewDto } from './schemas/request/create-episode-review.request.schema';
import { ValidationErrorResponseDto } from '@src/shared/http/schemas/response/validation-error.response.schema';
import { CreateEpisodeReviewResponseDto } from './schemas/response/create-episode-review.response.schema';

@ApiTags('episodes')
@Controller('/episodes')
export class CreateEpisodeReviewController {
  constructor(
    private readonly createEpisodeReviewService: CreateEpisodeReviewService,
  ) {}

  @Post(':episodeId/reviews')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create an episode review' })
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
    description: 'Invalid request body',
    type: ValidationErrorResponseDto,
  })
  async createEpisodeReview(
    @Param('episodeId') episodeId: string,
    @Body() body: CreateEpisodeReviewDto,
  ) {
    const { result, focusSessionId } = body;

    return this.createEpisodeReviewService.createEpisodeReview(
      episodeId,
      result,
      focusSessionId,
    );
  }
}
