import { Body, Controller, HttpCode, Post, UsePipes } from '@nestjs/common';
import {
  createEpisodeSchema,
  type CreateEpisodeRequest,
} from './schemas/episode.type';
import { ZodValidationPipe } from '../../pipes/ZodValidationPipe';
import { CreateEpisodeService } from '../services/create-episode.service';

@Controller('/episodes')
export class CreateEpisodeController {
  constructor(private readonly createEpisodeService: CreateEpisodeService) {}

  @Post()
  @HttpCode(201)
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
