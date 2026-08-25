import { ZodValidationPipe } from '@shared/pipes/ZodValidationPipe';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import {
  Controller,
  HttpCode,
  Param,
  Body,
  NotFoundException,
  Patch,
} from '@nestjs/common';
import { UpdateAnnotationService } from '../services/update-annotation.service';

import z from 'zod';
import { ValidationErrorResponseDto } from '@src/shared/http/schemas/response/validation-error.response.schema';
import { NotFoundErrorResponseDto } from '@src/shared/http/schemas/response/not-found-error.response.schema';
import { UpdateAnnotationResponseDto } from './schemas/response/update-annotation.response.schema';

const episodeIdSchema = z.uuid();
type EpisodeId = z.infer<typeof episodeIdSchema>;

const idSchema = z.uuid();
type Id = z.infer<typeof idSchema>;

const updateAnnotationSchema = z.object({
  text: z.string().trim().min(1).max(1000),
});
type UpdateAnnotationDto = z.infer<typeof updateAnnotationSchema>;

@ApiTags('annotations')
@Controller('/episodes')
export class UpdateAnnotationController {
  constructor(
    private readonly updateAnnotationService: UpdateAnnotationService,
  ) {}

  @Patch(':episodeId/annotations/:id')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Update an existing annotation',
  })
  @ApiParam({
    name: 'episodeId',
    description: 'The ID of the episode',
    required: true,
    format: 'uuid',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the annotation',
    required: true,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'The annotation has been successfully updated.',
    type: UpdateAnnotationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid annotation data',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Annotation or episode not found',
    type: NotFoundErrorResponseDto,
  })
  async updateAnnotation(
    @Param('episodeId', new ZodValidationPipe(episodeIdSchema))
    episodeId: EpisodeId,
    @Param('id', new ZodValidationPipe(idSchema)) id: Id,
    @Body(new ZodValidationPipe(updateAnnotationSchema))
    body: UpdateAnnotationDto,
  ) {
    const updatedAnnotation =
      await this.updateAnnotationService.updateAnnotation(episodeId, body, id);
    if (!updatedAnnotation) {
      throw new NotFoundException(
        `Annotation with ID ${id} or episode with ID ${episodeId} not found`,
      );
    }
    return { annotation: updatedAnnotation };
  }
}
