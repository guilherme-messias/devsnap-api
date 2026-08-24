import { Controller, Delete, HttpCode, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { NotFoundErrorResponseDto } from '@src/shared/http/schemas/response/not-found-error.response.schema';
import { ZodValidationPipe } from '@shared/pipes/ZodValidationPipe';
import z from 'zod';
import { DeleteAnnotationsByIdService } from '../services/delete-annotations-by-id.service';

const episodeIdSchema = z.uuid();
type EpisodeId = z.infer<typeof episodeIdSchema>;

const idSchema = z.uuid();
type Id = z.infer<typeof idSchema>;

@ApiTags('annotations')
@Controller('/episodes')
export class DeleteAnnotationsByIdController {
  constructor(
    private readonly deleteAnnotationsByIdService: DeleteAnnotationsByIdService,
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
    status: 404,
    description: 'Annotation not found',
    type: NotFoundErrorResponseDto,
  })
  async deleteAnnotationsById(
    @Param('episodeId', new ZodValidationPipe(episodeIdSchema))
    episodeId: EpisodeId,
    @Param('id', new ZodValidationPipe(idSchema)) id: Id,
  ) {
    return this.deleteAnnotationsByIdService.deleteAnnotationsById(
      id,
      episodeId,
    );
  }
}
