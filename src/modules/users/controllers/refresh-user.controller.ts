import { RefreshUserService } from '../services/refresh-user.service';
import {
  Controller,
  Post,
  HttpCode,
  UnauthorizedException,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RefreshUserResponseDto } from './schemas/response/refresh-user.response.schema';
import { RefreshTokenInvalidErrorResponseDto } from '@src/shared/http/schemas/response/refresh-token-invalid.response.schema';
import { AuthGuard } from '@nestjs/passport';

interface RequestWithUser extends Request {
  user: {
    sub: string;
    refreshToken: string;
  };
}

@ApiTags('users')
@Controller('/auth')
@UseGuards(AuthGuard('jwt-refresh'))
export class RefreshUserController {
  constructor(private readonly refreshUserService: RefreshUserService) {}
  @Post('refresh')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Refresh user tokens',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'The tokens have been successfully refreshed.',
    type: RefreshUserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token invalid',
    type: RefreshTokenInvalidErrorResponseDto,
  })
  async refreshUser(@Req() req: RequestWithUser) {
    const userId = req.user.sub;
    const refreshToken = req.user.refreshToken;

    const result = await this.refreshUserService.refreshUser({
      userId,
      refreshToken,
    });

    if (!result) {
      throw new UnauthorizedException('Refresh token invalid');
    }

    return result;
  }
}
