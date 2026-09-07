import {
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ZodValidationPipe } from '@shared/pipes/ZodValidationPipe';
import { DeleteAnnotationByIdService } from '../services/delete-annotation-by-id.service';
import { ValidationErrorResponseDto } from '@http/schemas/response/validation-error.response.schema';
import { JwtUnauthorizedErrorResponseDto } from '@http/schemas/response/jwt-unauthorized-error.response.schema';
import { AnnotationOrEpisodeNotFoundErrorResponseDto } from '@http/schemas/response/annotation-or-episode-not-found-error.response.schema';
import {
  uuidParamSchema,
  type UuidParam,
} from '@http/schemas/request/uuid-param.schema';
import type { RequestWithUser } from '@http/types/request-with-user';

@ApiTags('annotations')
@Controller('/episodes')
@UseGuards(AuthGuard('jwt'))
export class DeleteAnnotationByIdController {
  constructor(
    private readonly deleteAnnotationByIdService: DeleteAnnotationByIdService,
  ) {}

  @Delete(':episodeId/annotations/:id')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete an annotation by ID',
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
    status: 204,
    description: 'Annotation deleted successfully',
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
  async deleteAnnotationById(
    @Param('episodeId', new ZodValidationPipe(uuidParamSchema))
    episodeId: UuidParam,
    @Param('id', new ZodValidationPipe(uuidParamSchema)) id: UuidParam,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;

    const deletedAnnotation =
      await this.deleteAnnotationByIdService.deleteAnnotationById(
        id,
        episodeId,
        userId,
      );

    if (!deletedAnnotation) {
      throw new NotFoundException('Annotation or episode not found');
    }

    return;
  }
}
