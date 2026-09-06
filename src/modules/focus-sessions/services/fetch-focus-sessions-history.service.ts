import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';
import {
  focusSessionWithItemsInclude,
  toFocusSessionResponse,
} from '../mappers/to-focus-session-response';

@Injectable()
export class FetchFocusSessionsHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async fetchFocusSessionsHistory(data: { page: number; perPage: number }) {
    const { page, perPage } = data;

    const focusSessions = await this.prisma.focusSession.findMany({
      where: {
        status: 'finished',
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
