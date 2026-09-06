import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@src/app.module';
import request from 'supertest';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';
import { createTestUser } from '../helpers/create-test-user';
import { authenticateTestUser } from '../helpers/authenticate-test-user';

describe('Get User Profile Controller (E2E)', () => {
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

  test('should return the user profile', async () => {
    const { refreshToken } = await authenticateTestUser(
      app,
      credentials.email,
      credentials.password,
    );

    const response = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${refreshToken}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('email');
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('avatarUrl');
    expect(response.body).toHaveProperty('role');
  });

  test('should return 401 when the authorization header is missing', async () => {
    const response = await request(app.getHttpServer())
      .get('/users/me')
      .expect(401);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Unauthorized');
  });

  test('should return 401 when the authorization header is invalid', async () => {
    const response = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Unauthorized');
  });
});
