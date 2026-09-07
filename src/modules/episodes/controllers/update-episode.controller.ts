import {
  Controller,
  HttpCode,
  Put,
  Body,
  Param,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { UpdateEpisodeService } from '../services/update-episode.service';
import { ZodValidationPipe } from '@shared/pipes/ZodValidationPipe';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import {
  updateEpisodeSchema,
  UpdateEpisodeDto,
} from '../schemas/request/update-episode.request.schema';
import { ValidationErrorResponseDto } from '@shared/http/schemas/response/validation-error.response.schema';
import { JwtUnauthorizedErrorResponseDto } from '@shared/http/schemas/response/jwt-unauthorized-error.response.schema';
import { EpisodeNotFoundErrorResponseDto } from '@src/shared/http/schemas/response/episode-not-found-error.response.schema';
import { StackNotFoundErrorResponseDto } from '@shared/http/schemas/response/stack-not-found-error.response.schema';
import { UpdateEpisodeResponseDto } from '../schemas/response/update-episode.response.schema';
import {
  uuidParamSchema,
  type UuidParam,
} from '@src/shared/http/schemas/request/uuid-param.schema';
import { CurrentUserId } from '@shared/http/decorators/current-user-id.decorator';

@ApiTags('episodes')
@Controller('/episodes')
@UseGuards(AuthGuard('jwt'))
export class UpdateEpisodeController {
  constructor(private readonly updateEpisodeService: UpdateEpisodeService) {}

  @Put(':id')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Update an existing episode',
  })
  @ApiBearerAuth()
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
    status: 401,
    description: 'Missing, invalid, or expired token',
    type: JwtUnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Episode not found',
    type: EpisodeNotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Stack not found',
    type: StackNotFoundErrorResponseDto,
  })
  async updateEpisode(
    @Param('id', new ZodValidationPipe(uuidParamSchema)) id: UuidParam,
    @Body(new ZodValidationPipe(updateEpisodeSchema))
    body: UpdateEpisodeDto,
    @CurrentUserId() userId: string,
  ) {
    const updatedEpisode = await this.updateEpisodeService.updateEpisode(
      id,
      body,
      userId,
    );

    if (!updatedEpisode) {
      throw new NotFoundException(`Episode with ID ${id} not found`);
    }

    if ('stackNotFound' in updatedEpisode) {
      throw new NotFoundException('Stack not found');
    }

    return { episode: updatedEpisode };
  }
}
