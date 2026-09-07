import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import {
  focusSessionWithItemsInclude,
  toFocusSessionResponse,
} from '../mappers/to-focus-session-response';

@Injectable()
export class FinishFocusSessionService {
  constructor(private readonly prisma: PrismaService) {}

  async finishFocusSession(sessionId: string, userId: string) {
    const existing = await this.prisma.focusSession.findFirst({
      where: { id: sessionId, stack: { userId } },
    });

    if (!existing) {
      return null;
    }

    const focusSession = await this.prisma.focusSession.update({
      where: { id: sessionId },
      data: {
        status: 'finished',
        finishedAt: new Date(),
      },
      include: focusSessionWithItemsInclude,
    });

    return toFocusSessionResponse(focusSession);
  }
}
