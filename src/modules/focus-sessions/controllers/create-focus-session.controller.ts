import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ZodValidationPipe } from '@src/shared/pipes/ZodValidationPipe';
import { ValidationErrorResponseDto } from '@src/shared/http/schemas/response/validation-error.response.schema';
import { JwtUnauthorizedErrorResponseDto } from '@src/shared/http/schemas/response/jwt-unauthorized-error.response.schema';
import { StackNotFoundErrorResponseDto } from '@src/shared/http/schemas/response/stack-not-found-error.response.schema';
import { CreateFocusSessionService } from '../services/create-focus-session.service';
import {
  CreateFocusSessionDto,
  createFocusSessionSchema,
} from '../schemas/request/create-focus-session.request.schema';
import { CreateFocusSessionResponseDto } from '../schemas/response/create-focus-session.response.schema';
import { CurrentUserId } from '@src/shared/http/decorators/current-user-id.decorator';

@ApiTags('focus-sessions')
@Controller('/focus-sessions')
@UseGuards(AuthGuard('jwt'))
export class CreateFocusSessionController {
  constructor(
    private readonly createFocusSessionService: CreateFocusSessionService,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a focus session from a stack' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'The focus session has been successfully created.',
    type: CreateFocusSessionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body or stack has no episodes',
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
  async createFocusSession(
    @Body(new ZodValidationPipe(createFocusSessionSchema))
    body: CreateFocusSessionDto,
    @CurrentUserId() userId: string,
  ) {
    const result = await this.createFocusSessionService.createFocusSession(
      body.stackId,
      userId,
    );

    if (!result) {
      throw new NotFoundException('Stack not found');
    }

    if ('empty' in result) {
      throw new BadRequestException('Stack has no episodes');
    }

    return result;
  }
}
