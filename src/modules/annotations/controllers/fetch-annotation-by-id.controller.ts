import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { ZodValidationPipe } from '@shared/pipes/ZodValidationPipe';
import { ValidationErrorResponseDto } from '@src/shared/http/schemas/response/validation-error.response.schema';
import z from 'zod';
import { FetchAnnotationResponseDto } from './schemas/response/fetch-annotation.response.schema';
import { FetchAnnotationByIdService } from '../services/fetch-annotation-by-id.service';
import { AnnotationOrEpisodeNotFoundErrorResponseDto } from '@src/shared/http/schemas/response/annotation-or-episode-not-found-error.response.schema';

const episodeIdSchema = z.uuid();
type EpisodeId = z.infer<typeof episodeIdSchema>;

const idSchema = z.uuid();
type Id = z.infer<typeof idSchema>;

@ApiTags('annotations')
@Controller('/episodes')
export class FetchAnnotationByIdController {
  constructor(
    private readonly fetchAnnotationByIdService: FetchAnnotationByIdService,
  ) {}

  @Get(':episodeId/annotations/:id')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Fetch an annotation by ID',
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
    status: 200,
    description: 'Annotation fetched successfully',
    type: FetchAnnotationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ID parameter',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Annotation or episode not found',
    type: AnnotationOrEpisodeNotFoundErrorResponseDto,
  })
  async fetchAnnotationById(
    @Param('episodeId', new ZodValidationPipe(episodeIdSchema))
    episodeId: EpisodeId,
    @Param('id', new ZodValidationPipe(idSchema)) id: Id,
  ) {
    const annotation =
      await this.fetchAnnotationByIdService.fetchAnnotationById(id, episodeId);

    if (!annotation) {
      throw new NotFoundException(`Annotation or episode not found`);
    }

    return { annotation };
  }
}
