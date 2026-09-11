import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { CreateStackDto } from '../schemas/request/create-stack.request.schema';
import { CacheKeys } from '@infrastructure/cache/cache-keys';
import { CacheRepository } from '@infrastructure/cache/cache-repository';

@Injectable()
export class CreateStackService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheRepository,
  ) {}

  async createStack(data: CreateStackDto, userId: string) {
    const { name } = data;

    const stack = await this.prisma.stack.create({
      data: {
        name,
        userId,
      },
    });

    await this.cache.delete(CacheKeys.dashboard(userId));

    return stack;
  }
}
