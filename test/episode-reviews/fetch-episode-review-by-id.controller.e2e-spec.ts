import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';
import { randomUUID } from 'crypto';
import { createTestUser } from '../helpers/create-test-user';

describe('Fetch Episode Review By Id Controller (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let stackId: string;
  let episodeId: string;
  let episodeReviewId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService);

    await app.init();

    const { user } = await createTestUser(prisma, '12345678');
    const stack = await prisma.stack.create({
      data: { name: 'Node.js', userId: user.id },
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

    const episodeReview = await prisma.episodeReview.create({
      data: { episodeId, result: 'Review 1', focusSessionId: randomUUID() },
    });
    episodeReviewId = episodeReview.id;
  });

  afterAll(async () => {
    await prisma.episodeReview.deleteMany({});
    await prisma.episode.deleteMany({});
    await prisma.stack.deleteMany({});
    await prisma.user.deleteMany();
    await app.close();
  });

  test('should be able to fetch an episode review by id', async () => {
    const response = await request(app.getHttpServer()).get(
      `/episodes/${episodeId}/reviews/${episodeReviewId}`,
    );
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      episodeReview: {
        id: episodeReviewId,
        result: 'Review 1',
        episodeId: episodeId,
        reviewAt: expect.any(String),
        focusSessionId: expect.any(String),
      },
    });
  });

  test('should return 404 for non-existing episode review id', async () => {
    const nonExistingEpisodeReviewId = '00000000-0000-0000-0000-000000000000';
    const response = await request(app.getHttpServer()).get(
      `/episodes/${episodeId}/reviews/${nonExistingEpisodeReviewId}`,
    );
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      statusCode: 404,
      message: 'Episode review or episode not found',
      error: 'Not Found',
    });
  });

  test('should return 404 when episode review belongs to another episode', async () => {
    const anotherEpisode = await prisma.episode.create({
      data: {
        title: 'Episode 2',
        error: 'Error 2',
        solution: 'Solution 2',
        stackId: stackId,
      },
    });

    const response = await request(app.getHttpServer())
      .get(`/episodes/${anotherEpisode.id}/reviews/${episodeReviewId}`)
      .expect(404);

    expect(response.body).toHaveProperty('statusCode', 404);
    expect(response.body).toHaveProperty(
      'message',
      'Episode review or episode not found',
    );
  });

  test('should return 404 for non-existing episode id', async () => {
    const nonExistingEpisodeId = '00000000-0000-0000-0000-000000000000';
    const response = await request(app.getHttpServer())
      .get(`/episodes/${nonExistingEpisodeId}/reviews/${episodeReviewId}`)
      .expect(404);
    expect(response.body).toHaveProperty('statusCode', 404);
    expect(response.body).toHaveProperty(
      'message',
      'Episode review or episode not found',
    );
  });

  test('should return 400 for invalid episode review id', async () => {
    const invalidEpisodeReviewId = 'invalid-uuid';
    const response = await request(app.getHttpServer())
      .get(`/episodes/${episodeId}/reviews/${invalidEpisodeReviewId}`)
      .expect(400);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('statusCode', 400);
    expect(response.body).toHaveProperty('message', 'Validation failed');
  });

  test('should return 400 for invalid episode id', async () => {
    const invalidEpisodeId = 'invalid-uuid';
    const response = await request(app.getHttpServer())
      .get(`/episodes/${invalidEpisodeId}/reviews/${episodeReviewId}`)
      .expect(400);
    expect(response.body).toHaveProperty('statusCode', 400);
    expect(response.body).toHaveProperty('message', 'Validation failed');
  });
});
