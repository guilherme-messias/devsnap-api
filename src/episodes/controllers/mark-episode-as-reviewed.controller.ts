import {
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  ParseBoolPipe,
  Patch,
} from '@nestjs/common';
import { MarkEpisodeAsReviewedService } from '../services/mark-episode-as-reviewed.service';
import { ApiParam, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotFoundErrorResponseDto } from './schemas/response/not-found-error.response.schema';
import { ValidationErrorResponseDto } from '../../http/schemas/response/validation-error.response.schema';

@ApiTags('episodes')
@Controller('/episodes')
export class MarkEpisodeAsReviewedController {
  constructor(
    private readonly markEpisodeAsReviewedService: MarkEpisodeAsReviewedService,
  ) {}

  @Patch(':id/reviewed/:reviewed')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Mark an episode as reviewed or unreviewed',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the episode to mark as reviewed or unreviewed',
    required: true,
    type: String,
  })
  @ApiParam({
    name: 'reviewed',
    description: 'Whether the episode is reviewed or not',
    required: true,
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns the updated episode after marking it as reviewed or unreviewed.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ID parameter',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Episode not found',
    type: NotFoundErrorResponseDto,
  })
  async markEpisodeAsReviewed(
    @Param('id') id: string,
    @Param('reviewed', ParseBoolPipe) reviewed: boolean,
  ) {
    const updatedEpisode =
      await this.markEpisodeAsReviewedService.markEpisodeAsReviewed(
        id,
        reviewed,
      );

    if (!updatedEpisode) {
      throw new NotFoundException(`Episode with ID ${id} not found`);
    }

    return { episode: updatedEpisode };
  }
}
