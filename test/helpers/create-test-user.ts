import * as argon2 from 'argon2';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';
import { randomUUID } from 'node:crypto';

export async function createTestUser(
  prisma: PrismaService,
  password,
) {
  const passwordHash = await argon2.hash(password);

  const user = await prisma.user.create({
    data: {
      name: 'Test User',
      email: `${randomUUID()}@test.com`,
      passwordHash,
    },
  });

  return { user, password };
}
