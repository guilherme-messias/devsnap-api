import {
  Controller,
  HttpCode,
  Put,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { UpdateEpisodeService } from '../services/update-episode.service';
import { ZodValidationPipe } from '../../../shared/pipes/ZodValidationPipe';
import z from 'zod';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  updateEpisodeSchema,
  UpdateEpisodeDto,
} from './schemas/request/update-episode.request.schema';
import { ValidationErrorResponseDto } from '../../../shared/http/schemas/response/validation-error.response.schema';
import { NotFoundErrorResponseDto } from './schemas/response/not-found-error.response.schema';
import { UpdateEpisodeResponseDto } from './schemas/response/update-episode-response.schema';

const idParamSchema = z.uuid();
type IdParam = z.infer<typeof idParamSchema>;

@ApiTags('episodes')
@Controller('/episodes')
export class UpdateEpisodeController {
  constructor(private readonly updateEpisodeService: UpdateEpisodeService) {}

  @Put(':id')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Update an existing episode',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the episode to update',
    required: true,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'The episode has been successfully updated.',
    type: UpdateEpisodeResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body or ID parameter',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Episode not found',
    type: NotFoundErrorResponseDto,
  })
  async updateEpisode(
    @Param('id', new ZodValidationPipe(idParamSchema)) id: IdParam,
    @Body(new ZodValidationPipe(updateEpisodeSchema))
    body: UpdateEpisodeDto,
  ) {
    const updatedEpisode = await this.updateEpisodeService.updateEpisode(
      id,
      body,
    );

    if (!updatedEpisode) {
      throw new NotFoundException(`Episode with ID ${id} not found`);
    }

    return { episode: updatedEpisode };
  }
}
