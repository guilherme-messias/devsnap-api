import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DeleteStackByIdService {
  constructor(private prisma: PrismaService) {}

  async deleteStackById(id: string) {
    const stack = await this.prisma.stack.findUnique({
      where: { id },
    });

    if (!stack) {
      return null;
    }

    const deletedStack = await this.prisma.stack.delete({
      where: { id },
    });

    return deletedStack;
  }
}
