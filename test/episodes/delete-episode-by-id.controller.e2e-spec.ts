import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@app';
import { CacheRepository } from '@infrastructure/cache/cache-repository';
import { InMemoryCacheRepository } from '@infrastructure/cache/in-memory/in-memory-cache.repository';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { createTestUser } from '../helpers/create-test-user';
import { authenticateTestUser } from '../helpers/authenticate-test-user';

describe('Delete Episode By Id (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cache: InMemoryCacheRepository;
  let stackId: string;
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
    cache = moduleRef.get(CacheRepository) as InMemoryCacheRepository;

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
    await prisma.episode.deleteMany({});
    await prisma.stack.deleteMany({});
    await prisma.user.deleteMany();
    await app.close();
  });

  test('should delete the episode by id', async () => {
    const episode = await prisma.episode.create({
      data: {
        title: 'Test Episode',
        stackId,
        error: 'Some error',
        solution: 'Some solution',
      },
    });

    await request(app.getHttpServer())
      .delete(`/episodes/${episode.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);

    const deletedEpisode = await prisma.episode.findUnique({
      where: { id: episode.id },
    });
    expect(deletedEpisode).toBeNull();
  });

  test('should return 404 for non-existing episode id', async () => {
    const nonExistingId = '00000000-0000-0000-0000-000000000000';

    const response = await request(app.getHttpServer())
      .delete(`/episodes/${nonExistingId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);

    expect(response.body).toHaveProperty('statusCode', 404);
    expect(response.body).toHaveProperty(
      'message',
      `Episode with ID ${nonExistingId} not found`,
    );
  });

  test('should return 400 for invalid episode id', async () => {
    const invalidId = 'invalid-uuid';

    const response = await request(app.getHttpServer())
      .delete(`/episodes/${invalidId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);

    expect(response.body).toHaveProperty('statusCode', 400);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Validation failed');
  });

  test('should return 401 when the authorization header is missing', async () => {
    const episode = await prisma.episode.create({
      data: {
        title: 'Unauthenticated Episode',
        stackId,
        error: 'Some error',
        solution: 'Some solution',
      },
    });

    const response = await request(app.getHttpServer())
      .delete(`/episodes/${episode.id}`)
      .expect(401);

    expect(response.body.message).toBe('Unauthorized');

    const episodeOnDatabase = await prisma.episode.findUnique({
      where: { id: episode.id },
    });
    expect(episodeOnDatabase).toBeTruthy();
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

    const response = await request(app.getHttpServer())
      .delete(`/episodes/${episode.id}`)
      .set('Authorization', `Bearer ${otherUserAccessToken}`)
      .expect(404);

    expect(response.body).toHaveProperty('statusCode', 404);
    expect(response.body).toHaveProperty(
      'message',
      `Episode with ID ${episode.id} not found`,
    );

    const episodeOnDatabase = await prisma.episode.findUnique({
      where: { id: episode.id },
    });
    expect(episodeOnDatabase).toBeTruthy();
  });
});
