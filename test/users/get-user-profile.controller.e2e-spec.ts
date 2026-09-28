import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '@app';
import { CacheRepository } from '@infrastructure/cache/cache-repository';
import { InMemoryCacheRepository } from '@infrastructure/cache/in-memory/in-memory-cache.repository';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { createTestUser } from '../helpers/create-test-user';
import { authenticateTestUser } from '../helpers/authenticate-test-user';
import { getAppServer } from '../helpers/http-server';
import { bodyOf } from '../helpers/body-of';

describe('Get User Profile Controller (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cache: InMemoryCacheRepository;
  let jwt: JwtService;
  let configService: ConfigService;
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
    cache = moduleRef.get<InMemoryCacheRepository>(CacheRepository);
    jwt = moduleRef.get(JwtService);
    configService = moduleRef.get(ConfigService);

    await app.init();
  });

  beforeEach(async () => {
    cache.clear();
    const { user, password } = await createTestUser(prisma);
    credentials = { email: user.email, password };
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  test('should return the user profile', async () => {
    const { accessToken } = await authenticateTestUser(
      app,
      credentials.email,
      credentials.password,
    );

    const response = await request(getAppServer(app))
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(response.status).toBe(200);
    expect(bodyOf(response)).toHaveProperty('id');
    expect(bodyOf(response)).toHaveProperty('email');
    expect(bodyOf(response)).toHaveProperty('name');
    expect(bodyOf(response)).toHaveProperty('avatarUrl');
    expect(bodyOf(response)).toHaveProperty('role');
  });

  test('should return 404 when the user is not found', async () => {
    const accessToken = await jwt.signAsync(
      { sub: randomUUID(), email: 'missing@test.com', typ: 'access' },
      {
        privateKey: Buffer.from(
          configService.getOrThrow<string>('JWT_PRIVATE_KEY'),
          'base64',
        ).toString('utf-8'),
        algorithm: 'RS256',
        expiresIn: '15m',
      },
    );

    const response = await request(getAppServer(app))
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);

    expect(bodyOf(response)).toEqual({
      statusCode: 404,
      message: 'User not found',
      error: 'Not Found',
    });
  });

  test('should return 404 when the user is not found', async () => {
    const { accessToken } = await authenticateTestUser(
      app,
      credentials.email,
      credentials.password,
    );

    const firstResponse = await request(getAppServer(app))
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(bodyOf(firstResponse).email).toBe(credentials.email);

    await request(getAppServer(app))
      .delete('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);

    const secondResponse = await request(getAppServer(app))
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
    expect(bodyOf(secondResponse)).toEqual({
      statusCode: 404,
      message: 'User not found',
      error: 'Not Found',
    });
  });

  test('should keep serving cached dashboard when data changes outside the API ', async () => {
    const { accessToken } = await authenticateTestUser(
      app,
      credentials.email,
      credentials.password,
    );

    const firstResponse = await request(getAppServer(app))
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(bodyOf(firstResponse).email).toBe(credentials.email);

    await prisma.user.delete({
      where: { id: bodyOf(firstResponse).id },
    });

    const secondResponse = await request(getAppServer(app))
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(bodyOf(secondResponse).email).toBe(credentials.email);
  });

  test('should return 401 when the authorization header is missing', async () => {
    const response = await request(getAppServer(app))
      .get('/users/me')
      .expect(401);
    expect(bodyOf(response)).toHaveProperty('message');
    expect(bodyOf(response).message).toBe('Unauthorized');
  });

  test('should return 401 when the authorization header is invalid', async () => {
    const response = await request(getAppServer(app))
      .get('/users/me')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
    expect(bodyOf(response)).toHaveProperty('message');
    expect(bodyOf(response).message).toBe('Unauthorized');
  });
});
