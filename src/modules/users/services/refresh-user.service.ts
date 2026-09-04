import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';
import { AuthService } from '@src/infrastructure/auth/auth.service';
import { RefreshUserDto } from '../controllers/schemas/request/refresh-user.request';
import argon2 from 'argon2';

@Injectable()
export class RefreshUserService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async refreshUser(data: RefreshUserDto) {
    const { userId, refreshToken } = data;

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user || !user.hashedRefreshToken) {
      return null;
    }

    const isRefreshTokenValid = await argon2.verify(
      user.hashedRefreshToken,
      refreshToken,
    );

    if (!isRefreshTokenValid) {
      return null;
    }

    const tokens = await this.authService.generateToken(user.id, user.email);
    await this.authService.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}
