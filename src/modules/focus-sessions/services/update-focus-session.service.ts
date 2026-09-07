import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';
import { UpdateFocusSessionDto } from '../schemas/request/update-focus-session.request.schema';
import {
  focusSessionWithItemsInclude,
  toFocusSessionResponse,
} from '../mappers/to-focus-session-response';

@Injectable()
export class UpdateFocusSessionService {
  constructor(private readonly prisma: PrismaService) {}

  async updateFocusSession(
    sessionId: string,
    data: UpdateFocusSessionDto,
    userId: string,
  ) {
    const existing = await this.prisma.focusSession.findFirst({
      where: { id: sessionId, stack: { userId } },
      include: {
        items: true,
      },
    });

    if (!existing) {
      return null;
    }

    if (data.currentIndex > existing.items.length) {
      return { invalidIndex: true as const };
    }

    const focusSession = await this.prisma.focusSession.update({
      where: { id: sessionId },
      data: {
        currentIndex: data.currentIndex,
      },
      include: focusSessionWithItemsInclude,
    });

    return toFocusSessionResponse(focusSession);
  }
}
