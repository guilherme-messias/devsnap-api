import { Controller, Get, Req, UnauthorizedException } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GetUserProfileService } from '../services/get-user-profile.service';
import type { RequestWithUser } from './types/request-with-user';
import { UserProfileResponseDto } from './schemas/response/get-user-profile.response.schema';
import { UnauthorizedErrorResponseDto } from '@src/shared/http/schemas/response/unauthorized-error.response.schema';

@ApiTags('users')
@Controller('/users')
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
    description: 'Unauthorized',
    type: UnauthorizedErrorResponseDto,
  })
  async getUserProfile(@Req() req: RequestWithUser) {
    const userId = req.user.sub;
    const userProfile = await this.getUserProfileService.getUserProfile(userId);
    if (!userProfile) {
      throw new UnauthorizedException('User not found');
    }
    return userProfile;
  }
}
