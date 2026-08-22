import {
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common';
import { MarkEpisodeAsReviewedService } from '../services/mark-episode-as-reviewed.service';
import { ApiParam, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotFoundErrorResponseDto } from './schemas/response/not-found-error.response.schema';
import { ValidationErrorResponseDto } from '../../../shared/http/schemas/response/validation-error.response.schema';
import { MarkEpisodeAsReviewedResponseDto } from './schemas/response/mark-episode-as-reviewed.response.schema';
import { ZodValidationPipe } from '../../../shared/pipes/ZodValidationPipe';
import z from 'zod';

const idParamSchema = z.uuid();

const reviewedParamSchema = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true');

const idParamValidationPipe = new ZodValidationPipe(idParamSchema);
const reviewedParamValidationPipe = new ZodValidationPipe(reviewedParamSchema);

type IdParam = z.infer<typeof idParamSchema>;
type ReviewedParam = z.infer<typeof reviewedParamSchema>;
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
    format: 'uuid',
  })
  @ApiParam({
    name: 'reviewed',
    description: 'Whether the episode is reviewed or not',
    required: true,
    type: 'string',
    enum: ['true', 'false'],
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns the updated episode after marking it as reviewed or unreviewed.',
    type: MarkEpisodeAsReviewedResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ID or reviewed parameter',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Episode not found',
    type: NotFoundErrorResponseDto,
  })
  async markEpisodeAsReviewed(
    @Param('id', idParamValidationPipe) id: IdParam,
    @Param('reviewed', reviewedParamValidationPipe) reviewed: ReviewedParam,
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
