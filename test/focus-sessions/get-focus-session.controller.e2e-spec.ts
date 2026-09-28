import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@app';
import { CacheRepository } from '@infrastructure/cache/cache-repository';
import { InMemoryCacheRepository } from '@infrastructure/cache/in-memory/in-memory-cache.repository';
import request from 'supertest';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { randomUUID } from 'crypto';
import { createTestUser } from '../helpers/create-test-user';
import { authenticateTestUser } from '../helpers/authenticate-test-user';
import { getAppServer } from '../helpers/http-server';
import { bodyOf } from '../helpers/body-of';

describe('Get Focus Session (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cache: InMemoryCacheRepository;
  let stackId: string;
  let episodeId: string;
  let sessionId: string;
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

    const authentication = await authenticateTestUser(
      app,
      user.email,
      password,
    );
    accessToken = authentication.accessToken;

    const { user: otherUser, password: otherUserPassword } =
      await createTestUser(prisma);

    const otherAuthentication = await authenticateTestUser(
      app,
      otherUser.email,
      otherUserPassword,
    );
    otherUserAccessToken = otherAuthentication.accessToken;

    const stack = await prisma.stack.create({
      data: { name: 'Node.js', userId: user.id },
    });
    stackId = stack.id;

    const episode = await prisma.episode.create({
      data: {
        title: 'Episode 1',
        stackId,
        error: 'Error 1',
        solution: 'Solution 1',
      },
    });
    episodeId = episode.id;

    const session = await prisma.focusSession.create({
      data: {
        stackId,
        status: 'in_progress',
        currentIndex: 0,
        items: {
          create: [
            {
              episodeId,
              position: 0,
              status: 'pending',
            },
          ],
        },
      },
    });
    sessionId = session.id;
  });

  beforeEach(() => {
    cache.clear();
  });

  afterAll(async () => {
    await prisma.focusSessionItem.deleteMany();
    await prisma.focusSession.deleteMany();
    await prisma.episode.deleteMany();
    await prisma.stack.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  test('should return the focus session by id', async () => {
    const response = await request(getAppServer(app))
      .get(`/focus-sessions/${sessionId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(bodyOf(response)).toEqual({
      id: sessionId,
      stackId,
      status: 'in_progress',
      startedAt: expect.any(String) as string,
      currentIndex: 0,
      items: [
        {
          episodeId,
          position: 0,
          status: 'pending',
        },
      ],
    });
  });

  test('should return 404 when focus session does not exist', async () => {
    const response = await request(getAppServer(app))
      .get(`/focus-sessions/${randomUUID()}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);

    expect(bodyOf(response).message).toEqual('Focus session not found');
  });

  test('should return 400 when sessionId is not a uuid', async () => {
    const response = await request(getAppServer(app))
      .get('/focus-sessions/invalid-uuid')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);

    expect(bodyOf(response).message).toContain('Validation failed');
  });

  test('should return 401 when the authorization header is missing', async () => {
    const response = await request(getAppServer(app))
      .get(`/focus-sessions/${sessionId}`)
      .expect(401);

    expect(bodyOf(response).message).toBe('Unauthorized');
  });

  test('should return 404 when the focus session belongs to another user', async () => {
    const response = await request(getAppServer(app))
      .get(`/focus-sessions/${sessionId}`)
      .set('Authorization', `Bearer ${otherUserAccessToken}`)
      .expect(404);

    expect(bodyOf(response).message).toEqual('Focus session not found');
  });
});
