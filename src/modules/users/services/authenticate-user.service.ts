import { PrismaService } from '@src/infrastructure/prisma/prisma.service';
import { AuthenticateUserDto } from '../controllers/schemas/request/authenticate-user.request';
import { Injectable } from '@nestjs/common';
import argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthenticateUserService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
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

    const accessToken = await this.jwt.sign({
      sub: user.id,
    });

    return {
      accessToken,
    };
  }
}
