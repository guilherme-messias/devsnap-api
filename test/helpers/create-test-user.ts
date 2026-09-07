import * as argon2 from 'argon2';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { randomUUID } from 'node:crypto';

export const TEST_USER_PASSWORD = 'Str0ng!Pass';

export async function createTestUser(
  prisma: PrismaService,
  password: string = TEST_USER_PASSWORD,
) {
  const passwordHash = await argon2.hash(password);

  const user = await prisma.user.create({
    data: {
      name: 'Test User',
      email: `${randomUUID()}@test.com`,
      passwordHash,
      hashedRefreshToken: null,
    },
  });

  return { user, password };
}
