import { Body, Controller, HttpCode, Post, UsePipes } from '@nestjs/common';
import {
  createEpisodeSchema,
  type CreateEpisodeRequest,
} from './schemas/episode.type';
import { ZodValidationPipe } from '../../pipes/ZodValidationPipe';
import { CreateEpisodeService } from '../services/create-episode.service';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';

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
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body',
  })
  @UsePipes(new ZodValidationPipe(createEpisodeSchema))
  async createEpisode(@Body() body: CreateEpisodeRequest) {
    const { title, stack, error, solution } = body;

    return this.createEpisodeService.createEpisode({
      title,
      stack,
      error,
      solution,
    });
  }
}
