import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

@Injectable()
export class FetchRecentStacksService {
  constructor(private prisma: PrismaService) {}

  async fetchRecentStacks(data: { page: number; perPage: number }) {
    const { page, perPage } = data;

    const stacks = await this.prisma.stack.findMany({
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return stacks;
  }
}
