import {
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from '@src/shared/pipes/ZodValidationPipe';
import { ValidationErrorResponseDto } from '@src/shared/http/schemas/response/validation-error.response.schema';
import { FocusSessionNotFoundErrorResponseDto } from '@src/shared/http/schemas/response/focus-session-not-found-error.response.schema';
import { FinishFocusSessionService } from '../services/finish-focus-session.service';
import { FinishFocusSessionResponseDto } from './schemas/response/finish-focus-session.response.schema';
import z from 'zod';

const sessionIdSchema = z.uuid();
type SessionId = z.infer<typeof sessionIdSchema>;

@ApiTags('focus-sessions')
@Controller('/focus-sessions')
export class FinishFocusSessionController {
  constructor(
    private readonly finishFocusSessionService: FinishFocusSessionService,
  ) {}

  @Post(':sessionId/finish')
  @HttpCode(200)
  @ApiOperation({ summary: 'Finish a focus session' })
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
    status: 404,
    description: 'Focus session not found',
    type: FocusSessionNotFoundErrorResponseDto,
  })
  async finishFocusSession(
    @Param('sessionId', new ZodValidationPipe(sessionIdSchema))
    sessionId: SessionId,
  ) {
    const focusSession =
      await this.finishFocusSessionService.finishFocusSession(sessionId);

    if (!focusSession) {
      throw new NotFoundException('Focus session not found');
    }

    return focusSession;
  }
}
