import { ZodValidationPipe } from '@shared/pipes/ZodValidationPipe';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import {
  Controller,
  HttpCode,
  Param,
  Body,
  NotFoundException,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UpdateAnnotationService } from '../services/update-annotation.service';

import { ValidationErrorResponseDto } from '@src/shared/http/schemas/response/validation-error.response.schema';
import { JwtUnauthorizedErrorResponseDto } from '@src/shared/http/schemas/response/jwt-unauthorized-error.response.schema';
import { UpdateAnnotationResponseDto } from '../schemas/response/update-annotation.response.schema';
import { AnnotationOrEpisodeNotFoundErrorResponseDto } from '@src/shared/http/schemas/response/annotation-or-episode-not-found-error.response.schema';
import {
  UpdateAnnotationDto,
  updateAnnotationSchema,
} from '../schemas/request/update-annotation.request.schema';
import {
  uuidParamSchema,
  type UuidParam,
} from '@src/shared/http/schemas/request/uuid-param.schema';
import { CurrentUserId } from '@src/shared/http/decorators/current-user-id.decorator';

@ApiTags('annotations')
@Controller('/episodes')
@UseGuards(AuthGuard('jwt'))
export class UpdateAnnotationController {
  constructor(
    private readonly updateAnnotationService: UpdateAnnotationService,
  ) {}

  @Patch(':episodeId/annotations/:id')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Update an existing annotation',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'episodeId',
    description: 'The ID of the episode',
    required: true,
    format: 'uuid',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the annotation',
    required: true,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'The annotation has been successfully updated.',
    type: UpdateAnnotationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid annotation data',
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
  async updateAnnotation(
    @Param('episodeId', new ZodValidationPipe(uuidParamSchema))
    episodeId: UuidParam,
    @Param('id', new ZodValidationPipe(uuidParamSchema)) id: UuidParam,
    @Body(new ZodValidationPipe(updateAnnotationSchema))
    body: UpdateAnnotationDto,
    @CurrentUserId() userId: string,
  ) {
    const updatedAnnotation = await this.updateAnnotationService.updateAnnotation(
      id,
      body,
      episodeId,
      userId,
    );
    if (!updatedAnnotation) {
      throw new NotFoundException(`Annotation or episode not found`);
    }
    return { annotation: updatedAnnotation };
  }
}
