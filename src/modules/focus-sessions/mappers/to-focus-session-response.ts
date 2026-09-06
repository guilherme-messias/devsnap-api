import { FocusSession, FocusSessionItem } from '@prisma/client';

type FocusSessionWithItems = FocusSession & {
  items: FocusSessionItem[];
};

export function toFocusSessionResponse(session: FocusSessionWithItems) {
  return {
    id: session.id,
    stackId: session.stackId,
    status: session.status,
    startedAt: session.startedAt,
    currentIndex: session.currentIndex,
    items: session.items.map((item) => ({
      episodeId: item.episodeId,
      position: item.position,
      status: item.status,
    })),
  };
}

export const focusSessionWithItemsInclude = {
  items: {
    orderBy: {
      position: 'asc' as const,
    },
  },
};
