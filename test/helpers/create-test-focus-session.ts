import { PrismaService } from '@src/infrastructure/prisma/prisma.service';

export async function createTestFocusSession(
  prisma: PrismaService,
  stackId: string,
) {
  return prisma.focusSession.create({
    data: {
      stackId,
      status: 'in_progress',
      currentIndex: 0,
    },
  });
}
