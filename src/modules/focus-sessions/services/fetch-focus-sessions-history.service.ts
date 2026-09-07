import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { PaginationParams } from '@http/schemas/request/page-query.schema';
import {
  focusSessionWithItemsInclude,
  toFocusSessionResponse,
} from '../mappers/to-focus-session-response';

@Injectable()
export class FetchFocusSessionsHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async fetchFocusSessionsHistory(data: PaginationParams, userId: string) {
    const { page, perPage } = data;

    const focusSessions = await this.prisma.focusSession.findMany({
      where: {
        status: 'finished',
        stack: { userId },
      },
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: {
        finishedAt: 'desc',
      },
      include: focusSessionWithItemsInclude,
    });

    return focusSessions.map(toFocusSessionResponse);
  }
}
