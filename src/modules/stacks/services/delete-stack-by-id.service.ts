import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';

@Injectable()
export class DeleteStackByIdService {
  constructor(private prisma: PrismaService) {}

  async deleteStackById(id: string, userId: string) {
    const stack = await this.prisma.stack.findFirst({
      where: { id, userId },
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
