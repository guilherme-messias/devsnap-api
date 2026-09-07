import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import {
  focusSessionWithItemsInclude,
  toFocusSessionResponse,
} from '../mappers/to-focus-session-response';

@Injectable()
export class ReviewFocusSessionItemService {
  constructor(private readonly prisma: PrismaService) {}

  async reviewFocusSessionItem(
    sessionId: string,
    episodeId: string,
    result: string,
    userId: string,
  ) {
    const focusSession = await this.prisma.focusSession.findFirst({
      where: { id: sessionId, stack: { userId } },
      include: {
        items: {
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!focusSession) {
      return null;
    }

    if (focusSession.status !== 'in_progress') {
      return { notInProgress: true as const };
    }

    const item = focusSession.items.find(
      (sessionItem) => sessionItem.episodeId === episodeId,
    );

    if (!item) {
      return { itemNotFound: true as const };
    }

    const shouldAdvance =
      focusSession.items[focusSession.currentIndex]?.episodeId === episodeId;

    const nextIndex = shouldAdvance
      ? focusSession.currentIndex + 1
      : focusSession.currentIndex;

    const updatedSession = await this.prisma.$transaction(async (tx) => {
      await tx.focusSessionItem.update({
        where: { id: item.id },
        data: {
          status: 'reviewed',
          answeredAt: new Date(),
        },
      });

      await tx.episodeReview.create({
        data: {
          episodeId,
          result,
          focusSessionId: sessionId,
        },
      });

      return tx.focusSession.update({
        where: { id: sessionId },
        data: {
          currentIndex: nextIndex,
        },
        include: focusSessionWithItemsInclude,
      });
    });

    return toFocusSessionResponse(updatedSession);
  }
}
