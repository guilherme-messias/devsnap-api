import {
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { FetchEpisodeByIdService } from '../services/fetch-episode-by-id.service';
import z from 'zod';
import { ZodValidationPipe } from '@shared/pipes/ZodValidationPipe';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ValidationErrorResponseDto } from '@shared/http/schemas/response/validation-error.response.schema';
import { FetchEpisodeResponseDto } from './schemas/response/fetch-episode.response.schema';
import { EpisodeNotFoundErrorResponseDto } from '@src/shared/http/schemas/response/episode-not-found-error.response.schema';

const idParamSchema = z.uuid();

const paramValidationPipe = new ZodValidationPipe(idParamSchema);
type IdParam = z.infer<typeof idParamSchema>;

@ApiTags('episodes')
@Controller('/episodes')
export class FetchEpisodeByIdController {
  constructor(
    private readonly fetchEpisodeByIdService: FetchEpisodeByIdService,
  ) {}

  @Get(':id')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Fetch an episode by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Episode ID',
    required: true,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'The episode has been successfully fetched.',
    type: FetchEpisodeResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ID parameter',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Episode not found',
    type: EpisodeNotFoundErrorResponseDto,
  })
  async fetchEpisodeById(@Param('id', paramValidationPipe) id: IdParam) {
    const episode = await this.fetchEpisodeByIdService.fetchEpisodeById(id);

    if (!episode) {
      throw new NotFoundException(`Episode with ID ${id} not found`);
    }

    return { episode };
  }
}
