import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@app';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import request from 'supertest';
import { createTestUser } from '../helpers/create-test-user';
import { authenticateTestUser } from '../helpers/authenticate-test-user';
import { createTestFocusSession } from '../helpers/create-test-focus-session';

describe('Fetch Recent Episode Reviews Controller (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let stackId: string;
  let episodeId: string;
  let userId: string;
  let accessToken: string;
  let otherUserAccessToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService);

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

    await prisma.episodeReview.create({
      data: {
        episodeId,
        result: 'Review 1',
        focusSessionId: focusSession.id,
      },
    });

    await prisma.episodeReview.create({
      data: {
        episodeId,
        result: 'Review 2',
        focusSessionId: focusSession.id,
      },
    });
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

  test('should return the most recent episode reviews', async () => {
    const response = await request(app.getHttpServer())
      .get(`/episodes/${episodeId}/reviews?page=1`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.episodeReviews).toBeInstanceOf(Array);
    expect(response.body.episodeReviews.length).toBe(1);
    expect(response.body.episodeReviews[0].result).toBe('Review 2');
  });

  test('should paginate correctly when page=2', async () => {
    const response = await request(app.getHttpServer())
      .get(`/episodes/${episodeId}/reviews?page=2`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.episodeReviews).toBeInstanceOf(Array);
    expect(response.body.episodeReviews.length).toBe(1);
    expect(response.body.episodeReviews[0].result).toBe('Review 1');
  });

  test('should default to page 1 when page is not provided', async () => {
    const response = await request(app.getHttpServer())
      .get(`/episodes/${episodeId}/reviews`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.episodeReviews).toBeInstanceOf(Array);
    expect(response.body.episodeReviews.length).toBe(1);
    expect(response.body.episodeReviews[0].result).toBe('Review 2');
  });

  test('should return 200 with empty reviews array when there are no reviews', async () => {
    await prisma.episodeReview.deleteMany({ where: { episodeId } });

    const response = await request(app.getHttpServer())
      .get(`/episodes/${episodeId}/reviews?page=1`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.episodeReviews).toBeInstanceOf(Array);
    expect(response.body.episodeReviews.length).toBe(0);
  });

  test('should return 200 with empty reviews array when page exceeds total pages', async () => {
    const response = await request(app.getHttpServer())
      .get(`/episodes/${episodeId}/reviews?page=3`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.episodeReviews).toBeInstanceOf(Array);
    expect(response.body.episodeReviews.length).toBe(0);
  });

  test('should return 400 when page is less than 1', async () => {
    const response = await request(app.getHttpServer())
      .get(`/episodes/${episodeId}/reviews?page=0`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);

    expect(response.body.message).toBe('Validation failed');
  });

  test('should return 400 when episodeId is not a uuid', async () => {
    const response = await request(app.getHttpServer())
      .get(`/episodes/invalid-uuid/reviews?page=1`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);

    expect(response.body.message).toBe('Validation failed');
  });

  test('should return 404 when episode is not found', async () => {
    const response = await request(app.getHttpServer())
      .get(`/episodes/${'00000000-0000-0000-0000-000000000000'}/reviews?page=1`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);

    expect(response.body.message).toBe('Episode not found');
  });

  test('should return 401 when the authorization header is missing', async () => {
    const response = await request(app.getHttpServer())
      .get(`/episodes/${episodeId}/reviews?page=1`)
      .expect(401);

    expect(response.body.message).toBe('Unauthorized');
  });

  test('should return 404 when the episode belongs to another user', async () => {
    const response = await request(app.getHttpServer())
      .get(`/episodes/${episodeId}/reviews?page=1`)
      .set('Authorization', `Bearer ${otherUserAccessToken}`)
      .expect(404);

    expect(response.body.message).toBe('Episode not found');
  });
});
