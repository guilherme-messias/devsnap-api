import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import request from 'supertest';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';

describe('Create Episode Review (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let episodeId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService);

    await app.init();

    const stack = await prisma.stack.create({ data: { name: 'Node.js' } });
    const episode = await prisma.episode.create({
      data: {
        title: 'Test Episode',
        stackId: stack.id,
        error: 'Some error',
        solution: 'Some solution',
      },
    });

    episodeId = episode.id;
  });

  afterAll(async () => {
    await prisma.episodeReview.deleteMany({});
    await prisma.episode.deleteMany({});
    await prisma.stack.deleteMany({});
    await app.close();
  });

  test('should create an episode review when payload is valid', async () => {
    const response = await request(app.getHttpServer())
      .post(`/episodes/${episodeId}/reviews`)
      .send({
        result: 'Some result',
        focusSessionId: 'some-focus-session-id',
      })
      .expect(201);

    const reviewOnDatabase = await prisma.episodeReview.findUnique({
      where: {
        id: response.body.id,
      },
    });

    expect(reviewOnDatabase).toBeTruthy();
    expect(response.body).toMatchObject({
      episodeId,
      result: 'Some result',
      focusSessionId: 'some-focus-session-id',
    });
  });

  test('should return 400 when payload is invalid', async () => {
    const response = await request(app.getHttpServer())
      .post(`/episodes/${episodeId}/reviews`)
      .send({
        result: 'Some result',
      })
      .expect(400);

    expect(response.body.message).toContain('Validation failed');
  });

  test('should return 400 when result is empty', async () => {
    const response = await request(app.getHttpServer())
      .post(`/episodes/${episodeId}/reviews`)
      .send({
        result: '   ',
        focusSessionId: 'some-focus-session-id',
      })
      .expect(400);

    expect(response.body.message).toContain('Validation failed');
  });

  test('should return 404 when episode does not exist', async () => {
    const response = await request(app.getHttpServer())
      .post(`/episodes/non-existent-episode-id/reviews`)
      .send({
        result: 'Some result',
        focusSessionId: 'some-focus-session-id',
      })
      .expect(404);

    expect(response.body.message).toEqual('Episode not found');
  });
});
