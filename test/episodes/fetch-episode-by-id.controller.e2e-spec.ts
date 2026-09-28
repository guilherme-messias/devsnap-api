import { INestApplication } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import request from 'supertest';
import { AppModule } from '@app';
import { CacheRepository } from '@infrastructure/cache/cache-repository';
import { InMemoryCacheRepository } from '@infrastructure/cache/in-memory/in-memory-cache.repository';
import { Test } from '@nestjs/testing';
import { createTestUser } from '../helpers/create-test-user';
import { authenticateTestUser } from '../helpers/authenticate-test-user';
import { getAppServer } from '../helpers/http-server';
import { bodyOf } from '../helpers/body-of';

describe('Fetch Episode By Id (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cache: InMemoryCacheRepository;
  let stackId: string;
  let accessToken: string;
  let otherUserAccessToken: string;
  let otherUserEpisodeId: string;

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
    const stack = await prisma.stack.create({
      data: { name: 'Node.js', userId: user.id },
    });
    stackId = stack.id;

    const authentication = await authenticateTestUser(
      app,
      user.email,
      password,
    );
    accessToken = authentication.accessToken;

    const { user: otherUser, password: otherUserPassword } =
      await createTestUser(prisma);

    const otherStack = await prisma.stack.create({
      data: { name: 'Rust', userId: otherUser.id },
    });

    const otherUserEpisode = await prisma.episode.create({
      data: {
        title: 'Other User Episode',
        stackId: otherStack.id,
        error: 'Other user error',
        solution: 'Other user solution',
      },
    });
    otherUserEpisodeId = otherUserEpisode.id;

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
    await prisma.episode.deleteMany({});
    await prisma.stack.deleteMany({});
    await prisma.user.deleteMany();
    await app.close();
  });

  test('should return the episode by id', async () => {
    const episode = await prisma.episode.create({
      data: {
        title: 'Test Episode',
        stackId,
        error: 'Some error',
        solution: 'Some solution',
        annotations: { create: [{ text: 'Investigation note' }] },
      },
    });

    const response = await request(getAppServer(app))
      .get(`/episodes/${episode.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(bodyOf(response)).toHaveProperty('episode');
    expect(bodyOf(response).episode).toHaveProperty('id', episode.id);
    expect(bodyOf(response).episode).toHaveProperty('title', episode.title);
    expect(bodyOf(response).episode).toHaveProperty('stackId', stackId);
    expect(bodyOf(response).episode.stack).toMatchObject({
      id: stackId,
      name: 'Node.js',
    });
    expect(bodyOf(response).episode).toHaveProperty('error', episode.error);
    expect(bodyOf(response).episode).toHaveProperty(
      'solution',
      episode.solution,
    );
    expect(bodyOf(response).episode.annotations).toEqual([
      expect.objectContaining({
        text: 'Investigation note',
        episodeId: episode.id,
      }),
    ]);
  });

  test('should return 404 for non-existing episode id', async () => {
    const nonExistingId = '00000000-0000-0000-0000-000000000000';

    const response = await request(getAppServer(app))
      .get(`/episodes/${nonExistingId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);

    expect(bodyOf(response)).toHaveProperty('statusCode', 404);
    expect(bodyOf(response)).toHaveProperty(
      'message',
      `Episode with ID ${nonExistingId} not found`,
    );
  });

  test('should return 400 for invalid episode id', async () => {
    const invalidId = 'invalid-uuid';

    const response = await request(getAppServer(app))
      .get(`/episodes/${invalidId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);

    expect(bodyOf(response)).toHaveProperty('statusCode', 400);
    expect(bodyOf(response)).toHaveProperty('message');
    expect(bodyOf(response).message).toContain('Validation failed');
  });

  test('should return 401 when the authorization header is missing', async () => {
    const response = await request(getAppServer(app))
      .get(`/episodes/${otherUserEpisodeId}`)
      .expect(401);

    expect(bodyOf(response).message).toBe('Unauthorized');
  });

  test('should return 404 when the episode belongs to another user', async () => {
    const episode = await prisma.episode.create({
      data: {
        title: 'Owner Episode',
        stackId,
        error: 'Some error',
        solution: 'Some solution',
      },
    });

    const response = await request(getAppServer(app))
      .get(`/episodes/${episode.id}`)
      .set('Authorization', `Bearer ${otherUserAccessToken}`)
      .expect(404);

    expect(bodyOf(response)).toHaveProperty('statusCode', 404);
    expect(bodyOf(response)).toHaveProperty(
      'message',
      `Episode with ID ${episode.id} not found`,
    );

    await request(getAppServer(app))
      .get(`/episodes/${otherUserEpisodeId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });
});
