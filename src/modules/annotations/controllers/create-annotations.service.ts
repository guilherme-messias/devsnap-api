import { CreateAnnotationsService } from '../services/create-annotations.service';
import { ZodValidationPipe } from '@shared/pipes/ZodValidationPipe';
import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  UsePipes,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateAnnotationsDto,
  createAnnotationsSchema,
} from './request/create-annotations.request';
import { ValidationErrorResponseDto } from '@shared/http/schemas/response/validation-error.response.schema';
import z from 'zod';
import { CreateAnnotationsResponseDto } from './response/create-annotations.response';
import { NotFoundErrorResponseDto } from '@shared/http/schemas/response/not-found-error.response.schema';

const episodeIdSchema = z.uuid();
type EpisodeId = z.infer<typeof episodeIdSchema>;

//TODO: nao está subindo no swagger
@ApiTags('annotations')
@Controller('/episodes')
export class CreateAnnotationsController {
  constructor(
    private readonly createAnnotationsService: CreateAnnotationsService,
  ) {}

  @Post(':episodeId/annotations')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new annotation' })
  @ApiResponse({
    status: 201,
    description: 'The annotation has been successfully created.',
    type: CreateAnnotationsResponseDto,
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
  @UsePipes(new ZodValidationPipe(createAnnotationsSchema))
  async createAnnotations(
    @Param('episodeId', new ZodValidationPipe(episodeIdSchema))
    episodeId: EpisodeId,
    @Body() data: CreateAnnotationsDto,
  ) {
    return this.createAnnotationsService.createAnnotations(data, episodeId);
  }
}
