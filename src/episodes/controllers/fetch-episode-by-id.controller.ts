import {
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { FetchEpisodeByIdService } from '../services/fetch-episode-by-id.service';
import z from 'zod';
import { ZodValidationPipe } from '../../pipes/ZodValidationPipe';

const idParamSchema = z.uuid();

const paramValidationPipe = new ZodValidationPipe(idParamSchema);
type IdParam = z.infer<typeof idParamSchema>;

@Controller('/episodes')
export class FetchEpisodeByIdController {
  constructor(
    private readonly fetchEpisodeByIdService: FetchEpisodeByIdService,
  ) {}

  @Get(':id')
  @HttpCode(200)
  async fetchEpisodeById(@Param('id', paramValidationPipe) id: IdParam) {
    const episode = await this.fetchEpisodeByIdService.fetchEpisodeById(id);

    if (!episode) {
      throw new NotFoundException(`Episode with ID ${id} not found`);
    }

    return { episode };
  }
}
