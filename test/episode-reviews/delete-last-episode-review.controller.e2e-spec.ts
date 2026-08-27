import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';
import { randomUUID } from 'crypto';
import request from 'supertest';

describe('Delete Last Episode Review Controller (E2E)', () => {
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
  });

  beforeEach(async () => {
    const stack = await prisma.stack.create({ data: { name: 'Node.js' } });
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
    await app.close();
  });

  afterEach(async () => {
    await prisma.episodeReview.deleteMany({});
    await prisma.episode.deleteMany({});
    await prisma.stack.deleteMany({});
  });

  test('should return 204 if the last episode review is deleted', async () => {
    await request(app.getHttpServer())
      .delete(`/episodes/${episodeId}/reviews/latest`)
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
      .expect(404);

    expect(response.body.message).toBe('Episode review or episode not found');
  });

  test('should return 404 if the episode is not found', async () => {
    const invalidEpisodeId = randomUUID();

    const response = await request(app.getHttpServer())
      .delete(`/episodes/${invalidEpisodeId}/reviews/latest`)
      .expect(404);

    expect(response.body.message).toBe('Episode review or episode not found');
  });

  test('should return 400 if the episode id is invalid', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/episodes/invalid-id/reviews/latest`)
      .expect(400);

    expect(response.body.message).toBe('Validation failed');
  });
});
