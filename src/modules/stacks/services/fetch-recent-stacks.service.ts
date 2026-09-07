import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { PaginationParams } from '@shared/http/schemas/request/page-query.schema';

@Injectable()
export class FetchRecentStacksService {
  constructor(private prisma: PrismaService) {}

  async fetchRecentStacks(data: PaginationParams, userId: string) {
    const { page, perPage } = data;

    const stacks = await this.prisma.stack.findMany({
      skip: (page - 1) * perPage,
      take: perPage,
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return stacks;
  }
}
