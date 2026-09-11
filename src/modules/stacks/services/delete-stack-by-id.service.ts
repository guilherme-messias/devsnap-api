import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { CacheRepository } from '@infrastructure/cache/cache-repository';
import { CacheKeys } from '@infrastructure/cache/cache-leys';

@Injectable()
export class DeleteStackByIdService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheRepository,
  ) {}

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

    this.cache.delete(CacheKeys.dashboard(userId));

    return deletedStack;
  }
}
