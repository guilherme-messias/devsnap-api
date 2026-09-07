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
import type { RequestWithUser } from '@http/types/request-with-user';
import { DeleteUserProfileService } from '../services/delete-user-profile.service';
import { JwtUnauthorizedErrorResponseDto } from '@http/schemas/response/jwt-unauthorized-error.response.schema';
import { UserNotFoundErrorResponseDto } from '@http/schemas/response/user-not-found-error.response.schema';

@ApiTags('users')
@Controller('/users')
@UseGuards(AuthGuard('jwt'))
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
  async deleteUserProfile(@Req() req: RequestWithUser) {
    const userId = req.user.sub;

    const deletedUser =
      await this.deleteUserProfileService.deleteUserProfile(userId);
    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }

    return;
  }
}
