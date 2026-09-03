import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private configService: ConfigService,
  ) {}

  async generateToken(userId: string, email: string) {
    const payload = { sub: userId, email };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        privateKey: Buffer.from(
          this.configService.get('JWT_PRIVATE_KEY'),
          'base64',
        ).toString('utf-8'),
        algorithm: 'RS256',
        expiresIn: '15m',
      }),
      this.jwt.signAsync(payload, {
        privateKey: Buffer.from(
          this.configService.get('JWT_PRIVATE_KEY'),
          'base64',
        ).toString('utf-8'),
        algorithm: 'RS256',
        expiresIn: '7d',
      }),
    ]);
    return { accessToken, refreshToken };
  }

  async updateRefreshTokenHash(userId: string, refreshToken: string | null) {
    if (!refreshToken) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { hashedRefreshToken: null },
      });
      return;
    }

    const hash = await argon2.hash(refreshToken);
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken: hash },
    });
  }
}
