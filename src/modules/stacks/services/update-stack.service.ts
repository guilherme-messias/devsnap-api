import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { UpdateStackDto } from '../schemas/request/update-stack.request.schema';
import { CacheRepository } from '@infrastructure/cache/cache-repository';
import { CacheKeys } from '@infrastructure/cache/cache-keys';

@Injectable()
export class UpdateStackService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheRepository,
  ) {}

  async updateStack(id: string, data: UpdateStackDto, userId: string) {
    const { count } = await this.prisma.stack.updateMany({
      where: { id, userId },
      data,
    });

    if (count === 0) {
      return null;
    }

    await this.cache.delete(CacheKeys.dashboard(userId));

    return this.prisma.stack.findFirst({
      where: { id, userId },
    });
  }
}
