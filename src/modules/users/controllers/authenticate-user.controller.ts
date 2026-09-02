import { AuthenticateUserService } from '../services/authenticate-user.service';
import { Controller, Post, Body, HttpCode, UsePipes } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthenticateUserResponseDto } from './schemas/response/authenticate-user.response.schema';
import { EmailOrPasswordInvalidErrorResponseDto } from '@src/shared/http/schemas/response/email-or-password-invalid.response.schema';
import {
  AuthenticateUserDto,
  authenticateUserSchema,
} from './schemas/request/authenticate-user.request';
import { ZodValidationPipe } from '@src/shared/pipes/ZodValidationPipe';

@ApiTags('users')
@Controller('/auth')
export class AuthenticateUserController {
  constructor(
    private readonly authenticateUserService: AuthenticateUserService,
  ) {}

  @Post('login')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Authenticate a user',
  })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully authenticated.',
    type: AuthenticateUserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Email or password invalid',
    type: EmailOrPasswordInvalidErrorResponseDto,
  })
  @UsePipes(new ZodValidationPipe(authenticateUserSchema))
  async authenticateUser(@Body() body: AuthenticateUserDto) {
    const { email, password } = body;

    return this.authenticateUserService.authenticateUser({ email, password });
  }
}
