import { Controller, Get, NotFoundException, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GetUserProfileService } from '../services/get-user-profile.service';
import type { RequestWithUser } from './types/request-with-user';
import { UserProfileResponseDto } from './schemas/response/get-user-profile.response.schema';
import { JwtUnauthorizedErrorResponseDto } from '@src/shared/http/schemas/response/jwt-unauthorized-error.response.schema';
import { UserNotFoundErrorResponseDto } from '@src/shared/http/schemas/response/user-not-found-error.response.schema';
import { AuthGuard } from '@nestjs/passport';
import { UseGuards } from '@nestjs/common';

@ApiTags('users')
@Controller('/users')
@UseGuards(AuthGuard('jwt-refresh'))
export class GetUserProfileController {
  constructor(private readonly getUserProfileService: GetUserProfileService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Current user profile',
    type: UserProfileResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Missing, invalid, or expired token',
    type: JwtUnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: UserNotFoundErrorResponseDto,
  })
  async getUserProfile(@Req() req: RequestWithUser) {
    const userId = req.user.sub;
    const userProfile = await this.getUserProfileService.getUserProfile(userId);
    if (!userProfile) {
      throw new NotFoundException('User not found');
    }
    return userProfile;
  }
}
