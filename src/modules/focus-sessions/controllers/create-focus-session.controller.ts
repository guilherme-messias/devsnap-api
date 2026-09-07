import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ZodValidationPipe } from '@shared/pipes/ZodValidationPipe';
import { ValidationErrorResponseDto } from '@http/schemas/response/validation-error.response.schema';
import { JwtUnauthorizedErrorResponseDto } from '@http/schemas/response/jwt-unauthorized-error.response.schema';
import { StackNotFoundErrorResponseDto } from '@http/schemas/response/stack-not-found-error.response.schema';
import { CreateFocusSessionService } from '../services/create-focus-session.service';
import {
  CreateFocusSessionDto,
  createFocusSessionSchema,
} from '../schemas/request/create-focus-session.request.schema';
import { CreateFocusSessionResponseDto } from '../schemas/response/create-focus-session.response.schema';
import type { RequestWithUser } from '@http/types/request-with-user';

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
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;

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
