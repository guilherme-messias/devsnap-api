import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ZodValidationPipe } from '@shared/pipes/ZodValidationPipe';
import { ValidationErrorResponseDto } from '@src/shared/http/schemas/response/validation-error.response.schema';
import { JwtUnauthorizedErrorResponseDto } from '@src/shared/http/schemas/response/jwt-unauthorized-error.response.schema';
import { FetchAnnotationResponseDto } from '../schemas/response/fetch-annotation.response.schema';
import { FetchAnnotationByIdService } from '../services/fetch-annotation-by-id.service';
import { AnnotationOrEpisodeNotFoundErrorResponseDto } from '@src/shared/http/schemas/response/annotation-or-episode-not-found-error.response.schema';
import {
  uuidParamSchema,
  type UuidParam,
} from '@src/shared/http/schemas/request/uuid-param.schema';
import { CurrentUserId } from '@src/shared/http/decorators/current-user-id.decorator';

@ApiTags('annotations')
@Controller('/episodes')
@UseGuards(AuthGuard('jwt'))
export class FetchAnnotationByIdController {
  constructor(
    private readonly fetchAnnotationByIdService: FetchAnnotationByIdService,
  ) {}

  @Get(':episodeId/annotations/:id')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Fetch an annotation by ID',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'episodeId',
    description: 'Episode ID',
    required: true,
    format: 'uuid',
  })
  @ApiParam({
    name: 'id',
    description: 'Annotation ID',
    required: true,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Annotation fetched successfully',
    type: FetchAnnotationResponseDto,
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
    description: 'Annotation or episode not found',
    type: AnnotationOrEpisodeNotFoundErrorResponseDto,
  })
  async fetchAnnotationById(
    @Param('episodeId', new ZodValidationPipe(uuidParamSchema))
    episodeId: UuidParam,
    @Param('id', new ZodValidationPipe(uuidParamSchema)) id: UuidParam,
    @CurrentUserId() userId: string,
  ) {
    const annotation =
      await this.fetchAnnotationByIdService.fetchAnnotationById(
        id,
        episodeId,
        userId,
      );

    if (!annotation) {
      throw new NotFoundException(`Annotation or episode not found`);
    }

    return { annotation };
  }
}
