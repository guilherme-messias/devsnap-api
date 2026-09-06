import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';
import { UpdateFocusSessionDto } from '../controllers/schemas/request/update-focus-session.request.schema';
import {
  focusSessionWithItemsInclude,
  toFocusSessionResponse,
} from '../mappers/to-focus-session-response';

@Injectable()
export class UpdateFocusSessionService {
  constructor(private readonly prisma: PrismaService) {}

  async updateFocusSession(sessionId: string, data: UpdateFocusSessionDto) {
    const existing = await this.prisma.focusSession.findUnique({
      where: { id: sessionId },
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
