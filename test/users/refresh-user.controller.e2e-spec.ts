import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';
import { createTestUser } from '../helpers/create-test-user';
import request from 'supertest';
import { authenticateTestUser } from '../helpers/authenticate-test-user';

describe('Refresh User (E2E)', () => {
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

  test('should refresh tokens when refresh token is valid', async () => {
    const { refreshToken } = await authenticateTestUser(
      app,
      credentials.email,
      credentials.password,
    );
    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Authorization', `Bearer ${refreshToken}`)
      .expect(201);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  });

  test('should return 401 when refresh token is invalid', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Authorization', `Bearer invalid-token`)
      .expect(401);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Unauthorized');
  });

  test('should return 401 when authorization header is missing', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .expect(401);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Unauthorized');
  });
});
