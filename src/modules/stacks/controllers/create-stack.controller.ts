import {
  Body,
  Controller,
  HttpCode,
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
import { CreateStackService } from '../services/create-stack.service';
import { CreateStackResponseDto } from '../schemas/response/create-stack.response.schema';
import { ValidationErrorResponseDto } from '@shared/http/schemas/response/validation-error.response.schema';
import { JwtUnauthorizedErrorResponseDto } from '@shared/http/schemas/response/jwt-unauthorized-error.response.schema';
import {
  createStackSchema,
  CreateStackDto,
} from '../schemas/request/create-stack.request.schema';
import { ZodValidationPipe } from '@shared/pipes/ZodValidationPipe';
import type { RequestWithUser } from '@shared/http/types/request-with-user';

@ApiTags('stacks')
@Controller('/stacks')
@UseGuards(AuthGuard('jwt'))
export class CreateStackController {
  constructor(private readonly createStackService: CreateStackService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new stack' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'The stack has been successfully created.',
    type: CreateStackResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Missing, invalid, or expired token',
    type: JwtUnauthorizedErrorResponseDto,
  })
  async createStack(
    @Body(new ZodValidationPipe(createStackSchema)) body: CreateStackDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;
    const { name } = body;
    return this.createStackService.createStack({ name }, userId);
  }
}
