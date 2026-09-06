import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';
import {
  focusSessionWithItemsInclude,
  toFocusSessionResponse,
} from '../mappers/to-focus-session-response';

@Injectable()
export class GetFocusSessionService {
  constructor(private readonly prisma: PrismaService) {}

  async getFocusSession(sessionId: string) {
    const focusSession = await this.prisma.focusSession.findUnique({
      where: { id: sessionId },
      include: focusSessionWithItemsInclude,
    });

    if (!focusSession) {
      return null;
    }

    return toFocusSessionResponse(focusSession);
  }
}
