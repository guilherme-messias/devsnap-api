import {
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
import { FinishFocusSessionService } from '../services/finish-focus-session.service';
import { FinishFocusSessionResponseDto } from '../schemas/response/finish-focus-session.response.schema';
import {
  uuidParamSchema,
  type UuidParam,
} from '@http/schemas/request/uuid-param.schema';
import type { RequestWithUser } from '@http/types/request-with-user';

@ApiTags('focus-sessions')
@Controller('/focus-sessions')
@UseGuards(AuthGuard('jwt'))
export class FinishFocusSessionController {
  constructor(
    private readonly finishFocusSessionService: FinishFocusSessionService,
  ) {}

  @Post(':sessionId/finish')
  @HttpCode(200)
  @ApiOperation({ summary: 'Finish a focus session' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'sessionId',
    description: 'Focus session ID',
    required: true,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'The focus session has been successfully finished.',
    type: FinishFocusSessionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid session ID',
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
  async finishFocusSession(
    @Param('sessionId', new ZodValidationPipe(uuidParamSchema))
    sessionId: UuidParam,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;

    const focusSession =
      await this.finishFocusSessionService.finishFocusSession(
        sessionId,
        userId,
      );

    if (!focusSession) {
      throw new NotFoundException('Focus session not found');
    }

    return focusSession;
  }
}
