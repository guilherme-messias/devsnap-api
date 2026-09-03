import { PrismaService } from '@src/infrastructure/prisma/prisma.service';
import { AuthenticateUserDto } from '../controllers/schemas/request/authenticate-user.request';
import { Injectable } from '@nestjs/common';
import argon2 from 'argon2';
import { AuthService } from '@src/infrastructure/auth/auth.service';
@Injectable()
export class AuthenticateUserService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async authenticateUser(data: AuthenticateUserDto) {
    const { email, password } = data;

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return null;
    }

    const passwordMatch = await argon2.verify(user.passwordHash, password);

    if (!passwordMatch) {
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
