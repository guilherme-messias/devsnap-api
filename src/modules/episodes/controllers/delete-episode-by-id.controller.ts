import {
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { DeleteEpisodeByIdService } from '../services/delete-episode-by-id.service';
import { ZodValidationPipe } from '@shared/pipes/ZodValidationPipe';
import { ValidationErrorResponseDto } from '@shared/http/schemas/response/validation-error.response.schema';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { EpisodeNotFoundErrorResponseDto } from '@src/shared/http/schemas/response/episode-not-found-error.response.schema';
import {
  uuidParamSchema,
  type UuidParam,
} from '@src/shared/http/schemas/request/uuid-param.schema';

const paramValidationPipe = new ZodValidationPipe(uuidParamSchema);
@ApiTags('episodes')
@Controller('/episodes')
export class DeleteEpisodeByIdController {
  constructor(
    private readonly deleteEpisodeByIdService: DeleteEpisodeByIdService,
  ) {}

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete an episode by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Episode ID',
    required: true,
    format: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: 'The episode has been successfully deleted.',
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
  async deleteEpisodeById(@Param('id', paramValidationPipe) id: UuidParam) {
    const deletedEpisode =
      await this.deleteEpisodeByIdService.deleteEpisodeById(id);

    if (!deletedEpisode) {
      throw new NotFoundException(`Episode with ID ${id} not found`);
    }

    return;
  }
}
