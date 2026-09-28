import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@app';
import { CacheRepository } from '@infrastructure/cache/cache-repository';
import { InMemoryCacheRepository } from '@infrastructure/cache/in-memory/in-memory-cache.repository';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { createTestUser } from '../helpers/create-test-user';
import { authenticateTestUser } from '../helpers/authenticate-test-user';
import { getAppServer } from '../helpers/http-server';
import { bodyOf } from '../helpers/body-of';

describe('Fetch Recent Stacks (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cache: InMemoryCacheRepository;
  let accessToken: string;
  let otherUserAccessToken: string;

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

    await prisma.stack.create({
      data: {
        name: 'Node.js',
        userId: user.id,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      },
    });
    await prisma.stack.create({
      data: {
        name: 'Python',
        userId: user.id,
        createdAt: new Date('2024-01-02T00:00:00.000Z'),
      },
    });

    const authentication = await authenticateTestUser(
      app,
      user.email,
      password,
    );
    accessToken = authentication.accessToken;

    const { user: otherUser, password: otherUserPassword } =
      await createTestUser(prisma);

    await prisma.stack.create({
      data: { name: 'Rust', userId: otherUser.id },
    });

    const otherAuthentication = await authenticateTestUser(
      app,
      otherUser.email,
      otherUserPassword,
    );
    otherUserAccessToken = otherAuthentication.accessToken;
  });

  beforeEach(() => {
    cache.clear();
  });

  afterAll(async () => {
    await prisma.stack.deleteMany({});
    await prisma.user.deleteMany();
    await app.close();
  });

  test('should fetch recent stacks', async () => {
    const response = await request(getAppServer(app))
      .get(`/stacks?page=1`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(bodyOf(response).stacks).toBeInstanceOf(Array);
    expect(bodyOf(response).stacks.length).toBe(1);
    expect(bodyOf(response).stacks[0].name).toBe('Python');
  });

  test('should paginate correctly when page=2', async () => {
    const response = await request(getAppServer(app))
      .get(`/stacks?page=2`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(bodyOf(response).stacks).toBeInstanceOf(Array);
    expect(bodyOf(response).stacks.length).toBe(1);
    expect(bodyOf(response).stacks[0].name).toBe('Node.js');
  });

  test('should default to page=1 when no page query param is provided', async () => {
    const response = await request(getAppServer(app))
      .get(`/stacks`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(bodyOf(response).stacks).toBeInstanceOf(Array);
    expect(bodyOf(response).stacks.length).toBe(1);
    expect(bodyOf(response).stacks[0].name).toBe('Python');
  });

  test('should not return stacks that belong to another user', async () => {
    const firstPage = await request(getAppServer(app))
      .get(`/stacks?page=1`)
      .set('Authorization', `Bearer ${otherUserAccessToken}`)
      .expect(200);

    expect(bodyOf(firstPage).stacks).toBeInstanceOf(Array);
    expect(bodyOf(firstPage).stacks.length).toBe(1);
    expect(bodyOf(firstPage).stacks[0].name).toBe('Rust');

    const secondPage = await request(getAppServer(app))
      .get(`/stacks?page=2`)
      .set('Authorization', `Bearer ${otherUserAccessToken}`)
      .expect(200);

    expect(bodyOf(secondPage).stacks).toBeInstanceOf(Array);
    expect(bodyOf(secondPage).stacks.length).toBe(0);
  });

  test('should return 401 when the authorization header is missing', async () => {
    const response = await request(getAppServer(app))
      .get(`/stacks?page=1`)
      .expect(401);

    expect(bodyOf(response).message).toBe('Unauthorized');
  });

  test('should return empty array when no stacks are found', async () => {
    await prisma.stack.deleteMany({});

    const response = await request(getAppServer(app))
      .get(`/stacks?page=1`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(bodyOf(response).stacks).toBeInstanceOf(Array);
    expect(bodyOf(response).stacks.length).toBe(0);
  });

  test('should return 400 when page is less than 1', async () => {
    const response = await request(getAppServer(app))
      .get(`/stacks?page=0`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);

    expect(bodyOf(response).message).toEqual('Validation failed');
  });

  test('should return 400 when page is not an integer', async () => {
    const response = await request(getAppServer(app))
      .get('/stacks?page=abc')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);

    expect(bodyOf(response).message).toEqual('Validation failed');
  });

  test('should return 400 when page is not a number', async () => {
    const response = await request(getAppServer(app))
      .get('/stacks?page=abc')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);

    expect(bodyOf(response).message).toEqual('Validation failed');
  });

  test('should return an empty array when page exceeds available stacks', async () => {
    const response = await request(getAppServer(app))
      .get('/stacks?page=99')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(bodyOf(response).stacks).toBeInstanceOf(Array);
    expect(bodyOf(response).stacks.length).toBe(0);
  });
});
