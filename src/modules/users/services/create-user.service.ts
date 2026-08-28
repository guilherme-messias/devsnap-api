import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';
import * as argon2 from 'argon2';
import { CreateUserDto } from '../controllers/schemas/request/create-user.request';

@Injectable()
export class CreateUserService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: CreateUserDto) {
    const { name, email, password, avatarUrl, role } = data;

    const existingUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      null;
    }

    const passwordHash = await argon2.hash(password);

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        avatarUrl,
        role,
      },
    });

    return user;
  }
}
