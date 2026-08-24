import { CreateAnnotationService } from '../services/create-annotation.service';
import { ZodValidationPipe } from '@shared/pipes/ZodValidationPipe';
import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateAnnotationDto,
  createAnnotationSchema,
} from './schemas/request/create-annotation.request.schema';
import { ValidationErrorResponseDto } from '@shared/http/schemas/response/validation-error.response.schema';
import z from 'zod';
import { CreateAnnotationResponseDto } from './schemas/response/create-annotation.response.schema';
import { NotFoundErrorResponseDto } from '@shared/http/schemas/response/not-found-error.response.schema';

const episodeIdSchema = z.uuid();
type EpisodeId = z.infer<typeof episodeIdSchema>;

@ApiTags('annotations')
@Controller('/episodes')
export class CreateAnnotationController {
  constructor(
    private readonly createAnnotationService: CreateAnnotationService,
  ) {}

  @Post(':episodeId/annotations')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new annotation' })
  @ApiParam({
    name: 'episodeId',
    description: 'Episode ID',
    required: true,
    format: 'uuid',
  })
  @ApiResponse({
    status: 201,
    description: 'The annotation has been successfully created.',
    type: CreateAnnotationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Episode not found',
    type: NotFoundErrorResponseDto,
  })
  async createAnnotation(
    @Param('episodeId', new ZodValidationPipe(episodeIdSchema))
    episodeId: EpisodeId,
    @Body(new ZodValidationPipe(createAnnotationSchema))
    body: CreateAnnotationDto,
  ) {
    return this.createAnnotationService.createAnnotation(body, episodeId);
  }
}
