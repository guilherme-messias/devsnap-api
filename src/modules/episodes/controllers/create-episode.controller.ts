import {
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  CreateEpisodeDto,
  createEpisodeSchema,
} from '../schemas/request/create-episode.request.schema';
import { ZodValidationPipe } from '@shared/pipes/ZodValidationPipe';
import { CreateEpisodeService } from '../services/create-episode.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateEpisodeResponseDto } from '../schemas/response/create-episode.response.schema';
import { ValidationErrorResponseDto } from '@shared/http/schemas/response/validation-error.response.schema';
import { JwtUnauthorizedErrorResponseDto } from '@shared/http/schemas/response/jwt-unauthorized-error.response.schema';
import { StackNotFoundErrorResponseDto } from '@shared/http/schemas/response/stack-not-found-error.response.schema';
import { CurrentUserId } from '@shared/http/decorators/current-user-id.decorator';

@ApiTags('episodes')
@Controller('/episodes')
@UseGuards(AuthGuard('jwt'))
export class CreateEpisodeController {
  constructor(private readonly createEpisodeService: CreateEpisodeService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Create a new episode',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'The episode has been successfully created.',
    type: CreateEpisodeResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Missing, invalid, or expired token',
    type: JwtUnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Stack not found',
    type: StackNotFoundErrorResponseDto,
  })
  async createEpisode(
    @Body(new ZodValidationPipe(createEpisodeSchema)) body: CreateEpisodeDto,
    @CurrentUserId() userId: string,
  ) {
    const { title, stackId, error, solution } = body;

    const episode = await this.createEpisodeService.createEpisode(
      {
        title,
        stackId,
        error,
        solution,
      },
      userId,
    );

    if (!episode) {
      throw new NotFoundException('Stack not found');
    }

    return episode;
  }
}
