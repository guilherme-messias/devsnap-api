import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import request from 'supertest';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';
import { createTestUser } from '../helpers/create-test-user';

describe('Fetch Focus Sessions History (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let stackId: string;
  let episodeId: string;
  let finishedSessionId: string;

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

    const episode = await prisma.episode.create({
      data: {
        title: 'Episode 1',
        stackId,
        error: 'Error 1',
        solution: 'Solution 1',
      },
    });
    episodeId = episode.id;

    await prisma.focusSession.create({
      data: {
        stackId,
        status: 'in_progress',
        currentIndex: 0,
        items: {
          create: [
            {
              episodeId,
              position: 0,
              status: 'pending',
            },
          ],
        },
      },
    });

    const finishedSession = await prisma.focusSession.create({
      data: {
        stackId,
        status: 'finished',
        currentIndex: 1,
        finishedAt: new Date(),
        items: {
          create: [
            {
              episodeId,
              position: 0,
              status: 'reviewed',
            },
          ],
        },
      },
    });
    finishedSessionId = finishedSession.id;
  });

  afterAll(async () => {
    await prisma.focusSessionItem.deleteMany();
    await prisma.focusSession.deleteMany();
    await prisma.episode.deleteMany();
    await prisma.stack.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  test('should return only finished focus sessions', async () => {
    const response = await request(app.getHttpServer())
      .get('/focus-sessions/history')
      .expect(200);

    expect(response.body.focusSessions).toHaveLength(1);
    expect(response.body.focusSessions[0]).toEqual({
      id: finishedSessionId,
      stackId,
      status: 'finished',
      startedAt: expect.any(String),
      currentIndex: 1,
      items: [
        {
          episodeId,
          position: 0,
          status: 'reviewed',
        },
      ],
    });
  });

  test('should return 400 when page is invalid', async () => {
    const response = await request(app.getHttpServer())
      .get('/focus-sessions/history')
      .query({ page: '0' })
      .expect(400);

    expect(response.body.message).toContain('Validation failed');
  });
});
