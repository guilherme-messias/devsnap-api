import {
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FetchEpisodeByIdService } from '../services/fetch-episode-by-id.service';
import { ZodValidationPipe } from '@shared/pipes/ZodValidationPipe';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ValidationErrorResponseDto } from '@shared/http/schemas/response/validation-error.response.schema';
import { JwtUnauthorizedErrorResponseDto } from '@shared/http/schemas/response/jwt-unauthorized-error.response.schema';
import { FetchEpisodeResponseDto } from '../schemas/response/fetch-episode.response.schema';
import { EpisodeNotFoundErrorResponseDto } from '@src/shared/http/schemas/response/episode-not-found-error.response.schema';
import {
  uuidParamSchema,
  type UuidParam,
} from '@src/shared/http/schemas/request/uuid-param.schema';
import { CurrentUserId } from '@shared/http/decorators/current-user-id.decorator';

const paramValidationPipe = new ZodValidationPipe(uuidParamSchema);
@ApiTags('episodes')
@Controller('/episodes')
@UseGuards(AuthGuard('jwt'))
export class FetchEpisodeByIdController {
  constructor(
    private readonly fetchEpisodeByIdService: FetchEpisodeByIdService,
  ) {}

  @Get(':id')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Fetch an episode by ID',
  })
  @ApiBearerAuth()
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
    status: 401,
    description: 'Missing, invalid, or expired token',
    type: JwtUnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Episode not found',
    type: EpisodeNotFoundErrorResponseDto,
  })
  async fetchEpisodeById(
    @Param('id', paramValidationPipe) id: UuidParam,
    @CurrentUserId() userId: string,
  ) {
    const episode = await this.fetchEpisodeByIdService.fetchEpisodeById(
      id,
      userId,
    );

    if (!episode) {
      throw new NotFoundException(`Episode with ID ${id} not found`);
    }

    return { episode };
  }
}
