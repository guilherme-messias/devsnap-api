import {
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DeleteEpisodeByIdService } from '../services/delete-episode-by-id.service';
import { ZodValidationPipe } from '@shared/pipes/ZodValidationPipe';
import { ValidationErrorResponseDto } from '@shared/http/schemas/response/validation-error.response.schema';
import { JwtUnauthorizedErrorResponseDto } from '@shared/http/schemas/response/jwt-unauthorized-error.response.schema';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { EpisodeNotFoundErrorResponseDto } from '@http/schemas/response/episode-not-found-error.response.schema';
import {
  uuidParamSchema,
  type UuidParam,
} from '@http/schemas/request/uuid-param.schema';
import type { RequestWithUser } from '@shared/http/types/request-with-user';

const paramValidationPipe = new ZodValidationPipe(uuidParamSchema);
@ApiTags('episodes')
@Controller('/episodes')
@UseGuards(AuthGuard('jwt'))
export class DeleteEpisodeByIdController {
  constructor(
    private readonly deleteEpisodeByIdService: DeleteEpisodeByIdService,
  ) {}

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete an episode by ID',
  })
  @ApiBearerAuth()
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
    status: 401,
    description: 'Missing, invalid, or expired token',
    type: JwtUnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Episode not found',
    type: EpisodeNotFoundErrorResponseDto,
  })
  async deleteEpisodeById(
    @Param('id', paramValidationPipe) id: UuidParam,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;

    const deletedEpisode =
      await this.deleteEpisodeByIdService.deleteEpisodeById(id, userId);

    if (!deletedEpisode) {
      throw new NotFoundException(`Episode with ID ${id} not found`);
    }

    return;
  }
}
