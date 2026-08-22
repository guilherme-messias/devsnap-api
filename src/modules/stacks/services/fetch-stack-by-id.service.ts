import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';

@Injectable()
export class FetchStackByIdService {
  constructor(private readonly prisma: PrismaService) {}
  async fetchStackById(id: string) {
    const stack = await this.prisma.stack.findUnique({
      where: { id },
    });

    return stack;
  }
}
