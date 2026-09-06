import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import request from 'supertest';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';
import { randomUUID } from 'crypto';
import { createTestUser } from '../helpers/create-test-user';

describe('Finish Focus Session (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let stackId: string;
  let episodeId: string;
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

    const episode = await prisma.episode.create({
      data: {
        title: 'Episode 1',
        stackId,
        error: 'Error 1',
        solution: 'Solution 1',
      },
    });
    episodeId = episode.id;
  });

  beforeEach(async () => {
    await prisma.focusSessionItem.deleteMany();
    await prisma.focusSession.deleteMany();

    const session = await prisma.focusSession.create({
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

  test('should finish a focus session', async () => {
    const response = await request(app.getHttpServer())
      .post(`/focus-sessions/${sessionId}/finish`)
      .expect(200);

    expect(response.body).toEqual({
      id: sessionId,
      stackId,
      status: 'finished',
      startedAt: expect.any(String),
      currentIndex: 0,
      items: [
        {
          episodeId,
          position: 0,
          status: 'pending',
        },
      ],
    });
  });

  test('should return 404 when focus session does not exist', async () => {
    const response = await request(app.getHttpServer())
      .post(`/focus-sessions/${randomUUID()}/finish`)
      .expect(404);

    expect(response.body.message).toEqual('Focus session not found');
  });

  test('should return 400 when sessionId is not a uuid', async () => {
    const response = await request(app.getHttpServer())
      .post('/focus-sessions/invalid-uuid/finish')
      .expect(400);

    expect(response.body.message).toContain('Validation failed');
  });
});
