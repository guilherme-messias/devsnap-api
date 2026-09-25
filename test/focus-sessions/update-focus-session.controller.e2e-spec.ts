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

describe('Update Focus Session (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cache: InMemoryCacheRepository;
  let stackId: string;
  let episodeIds: string[];
  let sessionId: string;
  let accessToken: string;
  let otherUserAccessToken: string;

  async function createSession() {
    return prisma.focusSession.create({
      data: {
        stackId,
        status: 'in_progress',
        currentIndex: 0,
        items: {
          create: episodeIds.map((episodeId, position) => ({
            episodeId,
            position,
            status: 'pending',
          })),
        },
      },
    });
  }

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

    const episodes = await Promise.all([
      prisma.episode.create({
        data: {
          title: 'Episode 1',
          stackId,
          error: 'Error 1',
          solution: 'Solution 1',
        },
      }),
      prisma.episode.create({
        data: {
          title: 'Episode 2',
          stackId,
          error: 'Error 2',
          solution: 'Solution 2',
        },
      }),
    ]);
    episodeIds = episodes.map((episode) => episode.id);

    const session = await createSession();
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

  test('should update currentIndex when payload is valid', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/focus-sessions/${sessionId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ currentIndex: 1 })
      .expect(200);

    expect(response.body).toEqual({
      id: sessionId,
      stackId,
      status: 'in_progress',
      startedAt: expect.any(String),
      currentIndex: 1,
      items: [
        {
          episodeId: episodeIds[0],
          position: 0,
          status: 'pending',
        },
        {
          episodeId: episodeIds[1],
          position: 1,
          status: 'pending',
        },
      ],
    });
  });

  test('should return 400 when currentIndex is out of bounds', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/focus-sessions/${sessionId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ currentIndex: 3 })
      .expect(400);

    expect(response.body.message).toEqual('Invalid currentIndex');
  });

  test('should return 400 when payload is invalid', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/focus-sessions/${sessionId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})
      .expect(400);

    expect(response.body.message).toContain('Validation failed');
  });

  test('should return 404 when focus session does not exist', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/focus-sessions/${randomUUID()}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ currentIndex: 0 })
      .expect(404);

    expect(response.body.message).toEqual('Focus session not found');
  });

  test('should return 401 when the authorization header is missing', async () => {
    const session = await createSession();

    const response = await request(app.getHttpServer())
      .patch(`/focus-sessions/${session.id}`)
      .send({ currentIndex: 1 })
      .expect(401);

    expect(response.body.message).toBe('Unauthorized');

    const sessionOnDatabase = await prisma.focusSession.findUnique({
      where: { id: session.id },
    });
    expect(sessionOnDatabase).toMatchObject({ currentIndex: 0 });
  });

  test('should return 404 when the focus session belongs to another user', async () => {
    const session = await createSession();

    const response = await request(app.getHttpServer())
      .patch(`/focus-sessions/${session.id}`)
      .set('Authorization', `Bearer ${otherUserAccessToken}`)
      .send({ currentIndex: 1 })
      .expect(404);

    expect(response.body.message).toEqual('Focus session not found');

    const sessionOnDatabase = await prisma.focusSession.findUnique({
      where: { id: session.id },
    });
    expect(sessionOnDatabase).toMatchObject({ currentIndex: 0 });
  });
});
