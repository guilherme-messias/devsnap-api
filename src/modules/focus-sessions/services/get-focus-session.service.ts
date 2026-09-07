import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import {
  focusSessionWithItemsInclude,
  toFocusSessionResponse,
} from '../mappers/to-focus-session-response';

@Injectable()
export class GetFocusSessionService {
  constructor(private readonly prisma: PrismaService) {}

  async getFocusSession(sessionId: string, userId: string) {
    const focusSession = await this.prisma.focusSession.findFirst({
      where: { id: sessionId, stack: { userId } },
      include: focusSessionWithItemsInclude,
    });

    if (!focusSession) {
      return null;
    }

    return toFocusSessionResponse(focusSession);
  }
}
