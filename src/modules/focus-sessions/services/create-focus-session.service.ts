import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import {
  focusSessionWithItemsInclude,
  toFocusSessionResponse,
} from '../mappers/to-focus-session-response';

function fisherYatesShuffle<T>(items: T[]): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

@Injectable()
export class CreateFocusSessionService {
  constructor(private readonly prisma: PrismaService) {}

  async createFocusSession(stackId: string, userId: string) {
    const stack = await this.prisma.stack.findFirst({
      where: { id: stackId, userId },
      include: {
        episodes: true,
      },
    });

    if (!stack) {
      return null;
    }

    if (stack.episodes.length === 0) {
      return { empty: true as const };
    }

    const shuffledEpisodes = fisherYatesShuffle(stack.episodes);

    const focusSession = await this.prisma.focusSession.create({
      data: {
        stackId,
        status: 'in_progress',
        currentIndex: 0,
        items: {
          create: shuffledEpisodes.map((episode, position) => ({
            episodeId: episode.id,
            position,
            status: 'pending',
          })),
        },
      },
      include: focusSessionWithItemsInclude,
    });

    return toFocusSessionResponse(focusSession);
  }
}
