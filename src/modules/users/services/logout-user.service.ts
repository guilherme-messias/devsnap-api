import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';
import { AuthService } from '@src/infrastructure/auth/auth.service';

@Injectable()
export class LogoutUserService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async logoutUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    await this.authService.updateRefreshTokenHash(userId, null);
  }
}
