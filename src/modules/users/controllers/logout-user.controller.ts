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
