import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { CreateStackDto } from '../controllers/schemas/request/create-stack.request';

@Injectable()
export class CreateStackService {
  constructor(private prisma: PrismaService) {}

  async createStack(data: CreateStackDto) {
    const { name } = data;

    const stack = await this.prisma.stack.create({
      data: {
        name,
      },
    });

    return stack;
  }
}
