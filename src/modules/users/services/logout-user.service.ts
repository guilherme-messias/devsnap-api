import { Injectable } from '@nestjs/common';
import { AuthService } from '@src/infrastructure/auth/auth.service';

@Injectable()
export class LogoutUserService {
  constructor(private authService: AuthService) {}

  async logoutUser(userId: string) {
    await this.authService.updateRefreshTokenHash(userId, null);
  }
}
