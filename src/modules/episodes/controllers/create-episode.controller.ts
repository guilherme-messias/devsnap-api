import { Body, Controller, HttpCode, Post, UsePipes } from '@nestjs/common';
import {
  CreateEpisodeDto,
  createEpisodeSchema,
} from './schemas/request/create-episode.request.schema';
import { ZodValidationPipe } from '../../../shared/pipes/ZodValidationPipe';
import { CreateEpisodeService } from '../services/create-episode.service';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { CreateEpisodeResponseDto } from './schemas/response/create-episode.response.schema';
import { ValidationErrorResponseDto } from '../../../shared/http/schemas/response/validation-error.response.schema';

@ApiTags('episodes')
@Controller('/episodes')
export class CreateEpisodeController {
  constructor(private readonly createEpisodeService: CreateEpisodeService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Create a new episode',
  })
  @ApiResponse({
    status: 201,
    description: 'The episode has been successfully created.',
    type: CreateEpisodeResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body',
    type: ValidationErrorResponseDto,
  })
  @UsePipes(new ZodValidationPipe(createEpisodeSchema))
  async createEpisode(@Body() body: CreateEpisodeDto) {
    const { title, stackId, error, solution } = body;

    return this.createEpisodeService.createEpisode({
      title,
      stackId,
      error,
      solution,
    });
  }
}
