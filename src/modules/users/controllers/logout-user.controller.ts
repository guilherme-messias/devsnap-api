import { type RequestWithUser } from './types/request-with-user';
import { Controller, Post, UseGuards, Req, HttpCode } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { LogoutUserService } from '../services/logout-user.service';
import { TokenExpiredErrorResponseDto } from '@src/shared/http/schemas/response/token-expired-error.response.schema';

@ApiTags('users')
@Controller('/auth')
@UseGuards(AuthGuard('jwt-refresh'))
export class LogoutUserController {
  constructor(private readonly logoutUserService: LogoutUserService) {}

  @Post('logout')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Logout user',
  })
  @ApiResponse({
    status: 401,
    description: 'Token expired',
    type: TokenExpiredErrorResponseDto,
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 204,
    description: 'User logged out successfully',
  })
  async logoutUser(@Req() req: RequestWithUser) {
    const userId = req.user.sub;
    await this.logoutUserService.logoutUser(userId);
  }
}
