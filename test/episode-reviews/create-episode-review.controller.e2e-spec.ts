import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import request from 'supertest';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';
import { randomUUID } from 'crypto';

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
    const focusSessionId = randomUUID();

    const response = await request(app.getHttpServer())
      .post(`/episodes/${episodeId}/reviews`)
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
      .send({
        focusSessionId: randomUUID(),
      })
      .expect(400);

    expect(response.body.message).toContain('Validation failed');
  });

  test('should return 400 when result is empty', async () => {
    const response = await request(app.getHttpServer())
      .post(`/episodes/${episodeId}/reviews`)
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
      .send({
        result: 'Some result',
        focusSessionId: randomUUID(),
      })
      .expect(404);

    expect(response.body.message).toEqual('Episode not found');
  });
});
