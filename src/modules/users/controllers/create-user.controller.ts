import { Controller, Post, HttpCode, UsePipes, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUserService } from '../services/create-user.service';
import { CreateUserResponseDto } from './schemas/response/create-user.response.schema';
import { ValidationErrorResponseDto } from '@src/shared/http/schemas/response/validation-error.response.schema';
import { ZodValidationPipe } from '@src/shared/pipes/ZodValidationPipe';
import {
  CreateUserDto,
  createUserSchema,
} from './schemas/request/create-user.request';

@ApiTags('users')
@Controller('/auth')
export class CreateUserController {
  constructor(private readonly createUserService: CreateUserService) {}

  @Post('register')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Create a new user',
  })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: CreateUserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body',
    type: ValidationErrorResponseDto,
  })
  @UsePipes(new ZodValidationPipe(createUserSchema))
  async createUser(@Body() body: CreateUserDto) {
    const { name, email, password, avatarUrl, role } = body;

    return this.createUserService.createUser({
      name,
      email,
      password,
      avatarUrl: avatarUrl ?? undefined,
      role: role ?? undefined,
    });
  }
}
