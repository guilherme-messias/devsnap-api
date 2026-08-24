import {
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { NotFoundErrorResponseDto } from '@src/shared/http/schemas/response/not-found-error.response.schema';
import { ZodValidationPipe } from '@shared/pipes/ZodValidationPipe';
import z from 'zod';
import { DeleteAnnotationByIdService } from '../services/delete-annotation-by-id.service';
import { ValidationErrorResponseDto } from '@src/shared/http/schemas/response/validation-error.response.schema';

const episodeIdSchema = z.uuid();
type EpisodeId = z.infer<typeof episodeIdSchema>;

const idSchema = z.uuid();
type Id = z.infer<typeof idSchema>;

@ApiTags('annotations')
@Controller('/episodes')
export class DeleteAnnotationByIdController {
  constructor(
    private readonly deleteAnnotationByIdService: DeleteAnnotationByIdService,
  ) {}

  @Delete(':episodeId/annotations/:id')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete an annotation by ID',
  })
  @ApiParam({
    name: 'episodeId',
    description: 'Episode ID',
    required: true,
    format: 'uuid',
  })
  @ApiParam({
    name: 'id',
    description: 'Annotation ID',
    required: true,
    format: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: 'Annotation deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ID parameter',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Annotation or episode not found',
    type: NotFoundErrorResponseDto,
  })
  async deleteAnnotationById(
    @Param('episodeId', new ZodValidationPipe(episodeIdSchema))
    episodeId: EpisodeId,
    @Param('id', new ZodValidationPipe(idSchema)) id: Id,
  ) {
    const deletedAnnotation =
      await this.deleteAnnotationByIdService.deleteAnnotationById(
        id,
        episodeId,
      );

    if (!deletedAnnotation) {
      throw new NotFoundException('Annotation or episode not found');
    }

    return;
  }
}
