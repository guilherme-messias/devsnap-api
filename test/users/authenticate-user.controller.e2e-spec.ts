import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@app';
import { CacheRepository } from '@infrastructure/cache/cache-repository';
import { InMemoryCacheRepository } from '@infrastructure/cache/in-memory/in-memory-cache.repository';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { createTestUser } from '../helpers/create-test-user';
import { getAppServer } from '../helpers/http-server';
import { bodyOf } from '../helpers/body-of';
import argon2 from 'argon2';
import request from 'supertest';

describe('Authenticate User (E2E)', () => {
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
    cache = moduleRef.get<InMemoryCacheRepository>(CacheRepository);

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

  test('should authenticate a user when payload is valid', async () => {
    const response = await request(getAppServer(app))
      .post('/auth/login')
      .send({
        email: credentials.email,
        password: credentials.password,
      })
      .expect(201);

    expect(bodyOf(response)).toMatchObject({
      accessToken: expect.any(String) as string,
      refreshToken: expect.any(String) as string,
    });

    const userOnDatabase = await prisma.user.findUnique({
      where: {
        email: credentials.email,
      },
    });

    expect(userOnDatabase).toBeTruthy();
    expect(userOnDatabase?.hashedRefreshToken).toBeTruthy();
    expect(
      await argon2.verify(
        userOnDatabase!.hashedRefreshToken!,
        bodyOf(response).refreshToken,
      ),
    ).toBe(true);
  });

  test('should return 401 when password is invalid', async () => {
    const response = await request(getAppServer(app))
      .post('/auth/login')
      .send({
        email: credentials.email,
        password: 'invalid-password',
      })
      .expect(401);

    expect(bodyOf(response).message).toEqual('Email or password invalid');
  });

  test('should return 401 when email is invalid', async () => {
    const response = await request(getAppServer(app))
      .post('/auth/login')
      .send({
        email: 'invalid-email@example.com',
        password: credentials.password,
      })
      .expect(401);

    expect(bodyOf(response).message).toEqual('Email or password invalid');
  });

  test('should return 400 when payload is invalid', async () => {
    const response = await request(getAppServer(app))
      .post('/auth/login')
      .send({
        email: credentials.email,
        password: '123456',
      })
      .expect(400);

    expect(bodyOf(response).message).toEqual('Validation failed');
  });

  test('should return 400 when email is empty', async () => {
    const response = await request(getAppServer(app))
      .post('/auth/login')
      .send({
        email: '   ',
        password: credentials.password,
      })
      .expect(400);

    expect(bodyOf(response).message).toEqual('Validation failed');
  });
});
