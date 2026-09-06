import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from '@src/shared/pipes/ZodValidationPipe';
import { ValidationErrorResponseDto } from '@src/shared/http/schemas/response/validation-error.response.schema';
import { StackNotFoundErrorResponseDto } from '@src/shared/http/schemas/response/stack-not-found-error.response.schema';
import { CreateFocusSessionService } from '../services/create-focus-session.service';
import {
  CreateFocusSessionDto,
  createFocusSessionSchema,
} from './schemas/request/create-focus-session.request.schema';
import { CreateFocusSessionResponseDto } from './schemas/response/create-focus-session.response.schema';

@ApiTags('focus-sessions')
@Controller('/focus-sessions')
export class CreateFocusSessionController {
  constructor(
    private readonly createFocusSessionService: CreateFocusSessionService,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a focus session from a stack' })
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
    status: 404,
    description: 'Stack not found',
    type: StackNotFoundErrorResponseDto,
  })
  async createFocusSession(
    @Body(new ZodValidationPipe(createFocusSessionSchema))
    body: CreateFocusSessionDto,
  ) {
    const result = await this.createFocusSessionService.createFocusSession(
      body.stackId,
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
