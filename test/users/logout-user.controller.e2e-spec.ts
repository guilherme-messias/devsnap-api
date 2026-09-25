import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { AppModule } from '@app';
import { CacheRepository } from '@infrastructure/cache/cache-repository';
import { InMemoryCacheRepository } from '@infrastructure/cache/in-memory/in-memory-cache.repository';
import { createTestUser } from '../helpers/create-test-user';
import { authenticateTestUser } from '../helpers/authenticate-test-user';
import request from 'supertest';

describe('Logout User Controller (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cache: InMemoryCacheRepository;
  let credentials: { email: string; password: string };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CacheRepository)
      .useClass(InMemoryCacheRepository)
      .compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService);
    cache = moduleRef.get(CacheRepository) as InMemoryCacheRepository;

    await app.init();

    const { user, password } = await createTestUser(prisma);
    credentials = { email: user.email, password };
  });

  beforeEach(() => {
    cache.clear();
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

  test('should return 401 when authorization header is missing', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/logout')
      .expect(401);

    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Unauthorized',
    });
  });

  test('should return 401 when authorization header is invalid', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);

    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Unauthorized',
    });
  });
});
