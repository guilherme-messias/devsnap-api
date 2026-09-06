import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import request from 'supertest';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';
import { randomUUID } from 'crypto';
import { createTestUser } from '../helpers/create-test-user';

describe('Review Focus Session Item (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let stackId: string;
  let episodeIds: string[];
  let sessionId: string;

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
  });

  beforeEach(async () => {
    await prisma.episodeReview.deleteMany();
    await prisma.focusSessionItem.deleteMany();
    await prisma.focusSession.deleteMany();

    const session = await prisma.focusSession.create({
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
    sessionId = session.id;
  });

  afterAll(async () => {
    await prisma.episodeReview.deleteMany();
    await prisma.focusSessionItem.deleteMany();
    await prisma.focusSession.deleteMany();
    await prisma.episode.deleteMany();
    await prisma.stack.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  test('should review an item and advance currentIndex', async () => {
    const response = await request(app.getHttpServer())
      .post(`/focus-sessions/${sessionId}/items/${episodeIds[0]}/review`)
      .send({ result: 'remembered' })
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
          status: 'reviewed',
        },
        {
          episodeId: episodeIds[1],
          position: 1,
          status: 'pending',
        },
      ],
    });

    const review = await prisma.episodeReview.findFirst({
      where: {
        episodeId: episodeIds[0],
        focusSessionId: sessionId,
      },
    });

    expect(review).toMatchObject({
      result: 'remembered',
      focusSessionId: sessionId,
    });
  });

  test('should return 400 when result is missing', async () => {
    const response = await request(app.getHttpServer())
      .post(`/focus-sessions/${sessionId}/items/${episodeIds[0]}/review`)
      .send({})
      .expect(400);

    expect(response.body.message).toContain('Validation failed');
  });

  test('should return 404 when focus session does not exist', async () => {
    const response = await request(app.getHttpServer())
      .post(`/focus-sessions/${randomUUID()}/items/${episodeIds[0]}/review`)
      .send({ result: 'remembered' })
      .expect(404);

    expect(response.body.message).toEqual('Focus session not found');
  });

  test('should return 404 when item does not belong to the session', async () => {
    const response = await request(app.getHttpServer())
      .post(`/focus-sessions/${sessionId}/items/${randomUUID()}/review`)
      .send({ result: 'remembered' })
      .expect(404);

    expect(response.body.message).toEqual('Focus session item not found');
  });

  test('should return 400 when session is finished', async () => {
    await prisma.focusSession.update({
      where: { id: sessionId },
      data: { status: 'finished', finishedAt: new Date() },
    });

    const response = await request(app.getHttpServer())
      .post(`/focus-sessions/${sessionId}/items/${episodeIds[0]}/review`)
      .send({ result: 'remembered' })
      .expect(400);

    expect(response.body.message).toEqual('Focus session is not in progress');
  });
});
