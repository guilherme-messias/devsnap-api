import {
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { DeleteEpisodeByIdService } from '../services/delete-episode-by-id.service';
import z from 'zod';
import { ZodValidationPipe } from '../../pipes/ZodValidationPipe';
import { ValidationErrorResponseDto } from '../../http/schemas/response/validation-error.response.schema';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { NotFoundErrorResponseDto } from './schemas/response/not-found-error.response.schema';

const idParamSchema = z.uuid();

const paramValidationPipe = new ZodValidationPipe(idParamSchema);
type IdParam = z.infer<typeof idParamSchema>;

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
    type: NotFoundErrorResponseDto,
  })
  async deleteEpisodeById(@Param('id', paramValidationPipe) id: IdParam) {
    const deletedEpisode =
      await this.deleteEpisodeByIdService.deleteEpisodeById(id);

    if (!deletedEpisode) {
      throw new NotFoundException(`Episode with ID ${id} not found`);
    }

    return;
  }
}
