import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import request from 'supertest';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';
import { randomUUID } from 'crypto';
import { createTestUser } from '../helpers/create-test-user';

describe('Update Focus Session (E2E)', () => {
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

    const { user } = await createTestUser(prisma);
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
    await prisma.focusSessionItem.deleteMany();
    await prisma.focusSession.deleteMany();
    await prisma.episode.deleteMany();
    await prisma.stack.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  test('should update currentIndex when payload is valid', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/focus-sessions/${sessionId}`)
      .send({ currentIndex: 1 })
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
          status: 'pending',
        },
        {
          episodeId: episodeIds[1],
          position: 1,
          status: 'pending',
        },
      ],
    });
  });

  test('should return 400 when currentIndex is out of bounds', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/focus-sessions/${sessionId}`)
      .send({ currentIndex: 3 })
      .expect(400);

    expect(response.body.message).toEqual('Invalid currentIndex');
  });

  test('should return 400 when payload is invalid', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/focus-sessions/${sessionId}`)
      .send({})
      .expect(400);

    expect(response.body.message).toContain('Validation failed');
  });

  test('should return 404 when focus session does not exist', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/focus-sessions/${randomUUID()}`)
      .send({ currentIndex: 0 })
      .expect(404);

    expect(response.body.message).toEqual('Focus session not found');
  });
});
