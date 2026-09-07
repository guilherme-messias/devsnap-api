import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotFoundException,
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
import { ZodValidationPipe } from '@shared/pipes/ZodValidationPipe';
import { ValidationErrorResponseDto } from '@http/schemas/response/validation-error.response.schema';
import { JwtUnauthorizedErrorResponseDto } from '@http/schemas/response/jwt-unauthorized-error.response.schema';
import { FocusSessionNotFoundErrorResponseDto } from '@http/schemas/response/focus-session-not-found-error.response.schema';
import { FocusSessionItemNotFoundErrorResponseDto } from '@http/schemas/response/focus-session-item-not-found-error.response.schema';
import { ReviewFocusSessionItemService } from '../services/review-focus-session-item.service';
import {
  ReviewFocusSessionItemDto,
  reviewFocusSessionItemSchema,
} from '../schemas/request/review-focus-session-item.request.schema';
import { ReviewFocusSessionItemResponseDto } from '../schemas/response/review-focus-session-item.response.schema';
import {
  uuidParamSchema,
  type UuidParam,
} from '@http/schemas/request/uuid-param.schema';
import type { RequestWithUser } from '@http/types/request-with-user';

@ApiTags('focus-sessions')
@Controller('/focus-sessions')
@UseGuards(AuthGuard('jwt'))
export class ReviewFocusSessionItemController {
  constructor(
    private readonly reviewFocusSessionItemService: ReviewFocusSessionItemService,
  ) {}

  @Post(':sessionId/items/:episodeId/review')
  @HttpCode(200)
  @ApiOperation({ summary: 'Review an item in a focus session' })
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
    description: 'The focus session item has been successfully reviewed.',
    type: ReviewFocusSessionItemResponseDto,
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
    description: 'Focus session or item not found',
    type: FocusSessionNotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Focus session item not found',
    type: FocusSessionItemNotFoundErrorResponseDto,
  })
  async reviewFocusSessionItem(
    @Param('sessionId', new ZodValidationPipe(uuidParamSchema))
    sessionId: UuidParam,
    @Param('episodeId', new ZodValidationPipe(uuidParamSchema))
    episodeId: UuidParam,
    @Body(new ZodValidationPipe(reviewFocusSessionItemSchema))
    body: ReviewFocusSessionItemDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;

    const result =
      await this.reviewFocusSessionItemService.reviewFocusSessionItem(
        sessionId,
        episodeId,
        body.result,
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
