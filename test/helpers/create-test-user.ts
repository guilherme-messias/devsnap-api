import { PrismaService } from '@src/infrastructure/prisma/prisma.service';
import { randomUUID } from 'node:crypto';

export async function createTestUser(prisma: PrismaService) {
  return prisma.user.create({
    data: {
      name: 'Test User',
      email: `${randomUUID()}@test.com`,
      passwordHash: 'test-password-hash',
    },
  });
}
