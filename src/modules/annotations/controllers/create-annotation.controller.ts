import { CreateAnnotationService } from '../services/create-annotation.service';
import { ZodValidationPipe } from '@shared/pipes/ZodValidationPipe';
import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import {
  CreateAnnotationDto,
  createAnnotationSchema,
} from '../schemas/request/create-annotation.request.schema';
import { ValidationErrorResponseDto } from '@shared/http/schemas/response/validation-error.response.schema';
import { JwtUnauthorizedErrorResponseDto } from '@shared/http/schemas/response/jwt-unauthorized-error.response.schema';
import { CreateAnnotationResponseDto } from '../schemas/response/create-annotation.response.schema';
import { EpisodeNotFoundErrorResponseDto } from '@http/schemas/response/episode-not-found-error.response.schema';
import {
  uuidParamSchema,
  type UuidParam,
} from '@http/schemas/request/uuid-param.schema';
import type { RequestWithUser } from '@shared/http/types/request-with-user';

@ApiTags('annotations')
@Controller('/episodes')
@UseGuards(AuthGuard('jwt'))
export class CreateAnnotationController {
  constructor(
    private readonly createAnnotationService: CreateAnnotationService,
  ) {}

  @Post(':episodeId/annotations')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new annotation' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'episodeId',
    description: 'Episode ID',
    required: true,
    format: 'uuid',
  })
  @ApiResponse({
    status: 201,
    description: 'The annotation has been successfully created.',
    type: CreateAnnotationResponseDto,
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
    description: 'Episode not found',
    type: EpisodeNotFoundErrorResponseDto,
  })
  async createAnnotation(
    @Param('episodeId', new ZodValidationPipe(uuidParamSchema))
    episodeId: UuidParam,
    @Body(new ZodValidationPipe(createAnnotationSchema))
    body: CreateAnnotationDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;

    return this.createAnnotationService.createAnnotation(
      body,
      episodeId,
      userId,
    );
  }
}
