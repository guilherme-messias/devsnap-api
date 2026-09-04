import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';
import { AppModule } from '@src/app.module';
import { createTestUser } from '../helpers/create-test-user';
import { authenticateTestUser } from '../helpers/authenticate-test-user';
import request from 'supertest';

describe('Logout User Controller (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let credentials: { email: string; password: string };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService);

    await app.init();

    const { user, password } = await createTestUser(prisma, '12345678');
    credentials = { email: user.email, password };
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await app.close();
  });

  test('should logout user', async () => {
    const { refreshToken } = await authenticateTestUser(
      app,
      credentials.email,
      credentials.password,
    );

    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${refreshToken}`)
      .expect(204);

    const user = await prisma.user.findUnique({
      where: {
        email: credentials.email,
      },
    });

    expect(user?.hashedRefreshToken).toBeNull();
  });
});
