import { ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import type { RequestWithUser } from './types/request-with-user';
import { DeleteUserProfileService } from '../services/delete-user-profile.service';
import { UnauthorizedErrorResponseDto } from '@src/shared/http/schemas/response/unauthorized-error.response.schema';
import { DeleteUserProfileResponseDto } from './schemas/response/delete-user-profile.response.schema';

@ApiTags('users')
@Controller('/users')
@UseGuards(AuthGuard('jwt-refresh'))
export class DeleteUserProfileController {
  constructor(
    private readonly deleteUserProfileService: DeleteUserProfileService,
  ) {}

  @Delete('me')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete current user profile' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 204,
    description: 'Current user profile deleted',
    type: DeleteUserProfileResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async deleteUserProfile(
    @Req() req: RequestWithUser,
  ): Promise<DeleteUserProfileResponseDto> {
    const userId = req.user.sub;

    const deletedUser =
      await this.deleteUserProfileService.deleteUserProfile(userId);
    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }
    return deletedUser;
  }
}
