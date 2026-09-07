import {
  BadRequestException,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Post,
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
import { ZodValidationPipe } from '@src/shared/pipes/ZodValidationPipe';
import { ValidationErrorResponseDto } from '@src/shared/http/schemas/response/validation-error.response.schema';
import { JwtUnauthorizedErrorResponseDto } from '@src/shared/http/schemas/response/jwt-unauthorized-error.response.schema';
import { FocusSessionNotFoundErrorResponseDto } from '@src/shared/http/schemas/response/focus-session-not-found-error.response.schema';
import { FocusSessionItemNotFoundErrorResponseDto } from '@src/shared/http/schemas/response/focus-session-item-not-found-error.response.schema';
import { SkipFocusSessionItemService } from '../services/skip-focus-session-item.service';
import { SkipFocusSessionItemResponseDto } from '../schemas/response/skip-focus-session-item.response.schema';
import {
  uuidParamSchema,
  type UuidParam,
} from '@src/shared/http/schemas/request/uuid-param.schema';
import { CurrentUserId } from '@src/shared/http/decorators/current-user-id.decorator';

@ApiTags('focus-sessions')
@Controller('/focus-sessions')
@UseGuards(AuthGuard('jwt'))
export class SkipFocusSessionItemController {
  constructor(
    private readonly skipFocusSessionItemService: SkipFocusSessionItemService,
  ) {}

  @Post(':sessionId/items/:episodeId/skip')
  @HttpCode(200)
  @ApiOperation({ summary: 'Skip an item in a focus session' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'sessionId',
    description: 'Focus session ID',
    required: true,
    format: 'uuid',
  })
  @ApiParam({
    name: 'episodeId',
    description: 'Episode ID',
    required: true,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'The focus session item has been successfully skipped.',
    type: SkipFocusSessionItemResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request or session is not in progress',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Missing, invalid, or expired token',
    type: JwtUnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Focus session not found',
    type: FocusSessionNotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Focus session item not found',
    type: FocusSessionItemNotFoundErrorResponseDto,
  })
  async skipFocusSessionItem(
    @Param('sessionId', new ZodValidationPipe(uuidParamSchema))
    sessionId: UuidParam,
    @Param('episodeId', new ZodValidationPipe(uuidParamSchema))
    episodeId: UuidParam,
    @CurrentUserId() userId: string,
  ) {
    const result = await this.skipFocusSessionItemService.skipFocusSessionItem(
      sessionId,
      episodeId,
      userId,
    );

    if (!result) {
      throw new NotFoundException('Focus session not found');
    }

    if ('itemNotFound' in result) {
      throw new NotFoundException('Focus session item not found');
    }

    if ('notInProgress' in result) {
      throw new BadRequestException('Focus session is not in progress');
    }

    return result;
  }
}
