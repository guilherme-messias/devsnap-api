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

    const passwordHash = await argon2.verify(user.passwordHash, password);

    if (!passwordHash) {
      return null;
    }

    const token = await this.jwt.sign({
      sub: user.id,
    });

    return {
      token,
    };
  }
}
