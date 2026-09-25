import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@app';
import { CacheRepository } from '@infrastructure/cache/cache-repository';
import { InMemoryCacheRepository } from '@infrastructure/cache/in-memory/in-memory-cache.repository';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { createTestUser } from '../helpers/create-test-user';
import { authenticateTestUser } from '../helpers/authenticate-test-user';
import { createTestFocusSession } from '../helpers/create-test-focus-session';

describe('Delete Last Episode Review Controller (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cache: InMemoryCacheRepository;
  let stackId: string;
  let episodeId: string;
  let episodeReviewId: string;
  let userId: string;
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
    userId = user.id;

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
  });

  beforeEach(async () => {
    cache.clear();
    const stack = await prisma.stack.create({
      data: { name: 'Node.js', userId },
    });
    stackId = stack.id;

    const episode = await prisma.episode.create({
      data: {
        title: 'Episode 1',
        error: 'Error 1',
        solution: 'Solution 1',
        stackId: stackId,
      },
    });
    episodeId = episode.id;

    const focusSession = await createTestFocusSession(prisma, stackId);

    const episodeReview = await prisma.episodeReview.create({
      data: {
        episodeId,
        result: 'Review 1',
        focusSessionId: focusSession.id,
      },
    });
    episodeReviewId = episodeReview.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await app.close();
  });

  afterEach(async () => {
    await prisma.episodeReview.deleteMany({});
    await prisma.focusSession.deleteMany({});
    await prisma.episode.deleteMany({});
    await prisma.stack.deleteMany({});
  });

  test('should return 204 if the last episode review is deleted', async () => {
    await request(app.getHttpServer())
      .delete(`/episodes/${episodeId}/reviews/latest`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);

    const deletedEpisodeReview = await prisma.episodeReview.findUnique({
      where: { id: episodeReviewId },
    });

    expect(deletedEpisodeReview).toBeNull();
  });

  test('should return 404 if the episode review is not found', async () => {
    await prisma.episodeReview.delete({ where: { id: episodeReviewId } });

    const response = await request(app.getHttpServer())
      .delete(`/episodes/${episodeId}/reviews/latest`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);

    expect(response.body.message).toBe('Episode review or episode not found');
  });

  test('should return 404 if the episode is not found', async () => {
    const invalidEpisodeId = randomUUID();

    const response = await request(app.getHttpServer())
      .delete(`/episodes/${invalidEpisodeId}/reviews/latest`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);

    expect(response.body.message).toBe('Episode review or episode not found');
  });

  test('should return 400 if the episode id is invalid', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/episodes/invalid-id/reviews/latest`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);

    expect(response.body.message).toBe('Validation failed');
  });

  test('should return 401 when the authorization header is missing', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/episodes/${episodeId}/reviews/latest`)
      .expect(401);

    expect(response.body.message).toBe('Unauthorized');

    const episodeReviewOnDatabase = await prisma.episodeReview.findUnique({
      where: { id: episodeReviewId },
    });
    expect(episodeReviewOnDatabase).toBeTruthy();
  });

  test('should return 404 when the episode belongs to another user', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/episodes/${episodeId}/reviews/latest`)
      .set('Authorization', `Bearer ${otherUserAccessToken}`)
      .expect(404);

    expect(response.body.message).toBe('Episode review or episode not found');

    const episodeReviewOnDatabase = await prisma.episodeReview.findUnique({
      where: { id: episodeReviewId },
    });
    expect(episodeReviewOnDatabase).toBeTruthy();
  });
});
