import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { CreateStackDto } from '../schemas/request/create-stack.request.schema';

@Injectable()
export class CreateStackService {
  constructor(private prisma: PrismaService) {}

  async createStack(data: CreateStackDto, userId: string) {
    const { name } = data;

    const stack = await this.prisma.stack.create({
      data: {
        name,
        userId,
      },
    });

    return stack;
  }
}
