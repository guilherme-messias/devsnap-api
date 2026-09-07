import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
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
import { UpdateFocusSessionService } from '../services/update-focus-session.service';
import {
  UpdateFocusSessionDto,
  updateFocusSessionSchema,
} from '../schemas/request/update-focus-session.request.schema';
import { UpdateFocusSessionResponseDto } from '../schemas/response/update-focus-session.response.schema';
import {
  uuidParamSchema,
  type UuidParam,
} from '@src/shared/http/schemas/request/uuid-param.schema';
import { CurrentUserId } from '@src/shared/http/decorators/current-user-id.decorator';

@ApiTags('focus-sessions')
@Controller('/focus-sessions')
@UseGuards(AuthGuard('jwt'))
export class UpdateFocusSessionController {
  constructor(
    private readonly updateFocusSessionService: UpdateFocusSessionService,
  ) {}

  @Patch(':sessionId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update a focus session' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'sessionId',
    description: 'Focus session ID',
    required: true,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'The focus session has been successfully updated.',
    type: UpdateFocusSessionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body, session ID, or currentIndex',
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
  async updateFocusSession(
    @Param('sessionId', new ZodValidationPipe(uuidParamSchema))
    sessionId: UuidParam,
    @Body(new ZodValidationPipe(updateFocusSessionSchema))
    body: UpdateFocusSessionDto,
    @CurrentUserId() userId: string,
  ) {
    const result = await this.updateFocusSessionService.updateFocusSession(
      sessionId,
      body,
      userId,
    );

    if (!result) {
      throw new NotFoundException('Focus session not found');
    }

    if ('invalidIndex' in result) {
      throw new BadRequestException('Invalid currentIndex');
    }

    return result;
  }
}
