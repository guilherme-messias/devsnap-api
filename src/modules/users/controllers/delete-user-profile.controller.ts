import { ApiTags } from '@nestjs/swagger';
import { Controller, Delete, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { RequestWithUser } from './types/request-with-user';
import { DeleteUserProfileService } from '../services/delete-user-profile.service';
import { UnauthorizedException } from '@nestjs/common';
import { ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UnauthorizedErrorResponseDto } from '@src/shared/http/schemas/response/unauthorized-error.response.schema';
import { UserProfileResponseDto } from './schemas/response/get-user-profile.response.schema';

@ApiTags('users')
@Controller('/users')
@UseGuards(AuthGuard('jwt-refresh'))
export class DeleteUserProfileController {
  constructor(
    private readonly deleteUserProfileService: DeleteUserProfileService,
  ) {}

  @Delete('me')
  @ApiOperation({ summary: 'Delete current user profile' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Current user profile deleted',
    type: UserProfileResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedErrorResponseDto,
  })
  async deleteUserProfile(@Req() req: RequestWithUser) {
    const userId = req.user.sub;

    const deletedUser =
      await this.deleteUserProfileService.deleteUserProfile(userId);
    if (!deletedUser) {
      throw new UnauthorizedException('User not found');
    }
    return deletedUser;
  }
}
