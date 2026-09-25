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
import { createTestFocusSession } from '../helpers/create-test-focus-session';

describe('Create Episode Review (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cache: InMemoryCacheRepository;
  let episodeId: string;
  let focusSessionId: string;
  let accessToken: string;
  let otherUserAccessToken: string;
  let otherUserFocusSessionId: string;

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

    const stack = await prisma.stack.create({
      data: { name: 'Node.js', userId: user.id },
    });
    const episode = await prisma.episode.create({
      data: {
        title: 'Test Episode',
        stackId: stack.id,
        error: 'Some error',
        solution: 'Some solution',
      },
    });

    episodeId = episode.id;

    const focusSession = await createTestFocusSession(prisma, stack.id);
    focusSessionId = focusSession.id;

    const { user: otherUser, password: otherUserPassword } =
      await createTestUser(prisma);

    const otherAuthentication = await authenticateTestUser(
      app,
      otherUser.email,
      otherUserPassword,
    );
    otherUserAccessToken = otherAuthentication.accessToken;

    const otherStack = await prisma.stack.create({
      data: { name: 'Python', userId: otherUser.id },
    });
    const otherFocusSession = await createTestFocusSession(
      prisma,
      otherStack.id,
    );
    otherUserFocusSessionId = otherFocusSession.id;
  });

  beforeEach(() => {
    cache.clear();
  });

  afterAll(async () => {
    await prisma.episodeReview.deleteMany({});
    await prisma.focusSession.deleteMany({});
    await prisma.episode.deleteMany({});
    await prisma.stack.deleteMany({});
    await prisma.user.deleteMany();
    await app.close();
  });

  test('should create an episode review when payload is valid', async () => {
    const response = await request(app.getHttpServer())
      .post(`/episodes/${episodeId}/reviews`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        result: 'Some result',
        focusSessionId,
      })
      .expect(201);

    const reviewOnDatabase = await prisma.episodeReview.findUnique({
      where: {
        id: response.body.id,
      },
    });

    expect(reviewOnDatabase).toBeTruthy();
    expect(response.body).toEqual({
      id: expect.any(String),
      episodeId,
      result: 'Some result',
      reviewAt: expect.any(String),
      focusSessionId,
    });
  });

  test('should create an episode review when focusSessionId is omitted', async () => {
    const response = await request(app.getHttpServer())
      .post(`/episodes/${episodeId}/reviews`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        result: 'Some result without focus session',
      })
      .expect(201);

    expect(response.body).toEqual({
      id: expect.any(String),
      episodeId,
      result: 'Some result without focus session',
      reviewAt: expect.any(String),
      focusSessionId: null,
    });
  });

  test('should create an episode review when focusSessionId is null', async () => {
    const response = await request(app.getHttpServer())
      .post(`/episodes/${episodeId}/reviews`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        result: 'Some result with null focus session',
        focusSessionId: null,
      })
      .expect(201);

    expect(response.body).toEqual({
      id: expect.any(String),
      episodeId,
      result: 'Some result with null focus session',
      reviewAt: expect.any(String),
      focusSessionId: null,
    });
  });

  test('should return 400 when payload is invalid', async () => {
    const response = await request(app.getHttpServer())
      .post(`/episodes/${episodeId}/reviews`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        focusSessionId: randomUUID(),
      })
      .expect(400);

    expect(response.body.message).toContain('Validation failed');
  });

  test('should return 400 when result is empty', async () => {
    const response = await request(app.getHttpServer())
      .post(`/episodes/${episodeId}/reviews`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        result: '   ',
        focusSessionId: randomUUID(),
      })
      .expect(400);

    expect(response.body.message).toContain('Validation failed');
  });

  test('should return 400 when result exceeds 500 characters', async () => {
    const response = await request(app.getHttpServer())
      .post(`/episodes/${episodeId}/reviews`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        result: 'a'.repeat(501),
        focusSessionId: randomUUID(),
      })
      .expect(400);

    expect(response.body.message).toContain('Validation failed');
  });

  test('should return 400 when focusSessionId is not a uuid', async () => {
    const response = await request(app.getHttpServer())
      .post(`/episodes/${episodeId}/reviews`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        result: 'Some result',
        focusSessionId: 'invalid-uuid',
      })
      .expect(400);

    expect(response.body.message).toContain('Validation failed');
  });

  test('should return 400 when episodeId is not a uuid', async () => {
    const response = await request(app.getHttpServer())
      .post(`/episodes/invalid-uuid/reviews`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        result: 'Some result',
        focusSessionId: randomUUID(),
      })
      .expect(400);

    expect(response.body.message).toContain('Validation failed');
  });

  test('should return 404 when episode does not exist', async () => {
    const response = await request(app.getHttpServer())
      .post(`/episodes/${randomUUID()}/reviews`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        result: 'Some result',
        focusSessionId: randomUUID(),
      })
      .expect(404);

    expect(response.body.message).toEqual('Episode not found');
  });

  test('should return 401 when the authorization header is missing', async () => {
    const response = await request(app.getHttpServer())
      .post(`/episodes/${episodeId}/reviews`)
      .send({
        result: 'Some result',
        focusSessionId,
      })
      .expect(401);

    expect(response.body.message).toBe('Unauthorized');
  });

  test('should return 404 when the episode belongs to another user', async () => {
    const response = await request(app.getHttpServer())
      .post(`/episodes/${episodeId}/reviews`)
      .set('Authorization', `Bearer ${otherUserAccessToken}`)
      .send({
        result: 'Some result',
      })
      .expect(404);

    expect(response.body.message).toEqual('Episode not found');
  });

  test('should return 404 when the focus session belongs to another user', async () => {
    const response = await request(app.getHttpServer())
      .post(`/episodes/${episodeId}/reviews`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        result: 'Some result',
        focusSessionId: otherUserFocusSessionId,
      })
      .expect(404);

    expect(response.body.message).toEqual('Focus session not found');
  });
});
