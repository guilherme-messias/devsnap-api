import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import request from 'supertest';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';
import { randomUUID } from 'crypto';
import { createTestUser } from '../helpers/create-test-user';
import { authenticateTestUser } from '../helpers/authenticate-test-user';

describe('Skip Focus Session Item (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let stackId: string;
  let episodeIds: string[];
  let sessionId: string;
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
    await prisma.focusSessionItem.deleteMany();
    await prisma.focusSession.deleteMany();
    await prisma.episode.deleteMany();
    await prisma.stack.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  test('should skip an item and advance currentIndex', async () => {
    const response = await request(app.getHttpServer())
      .post(`/focus-sessions/${sessionId}/items/${episodeIds[0]}/skip`)
      .set('Authorization', `Bearer ${accessToken}`)
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
          status: 'skipped',
        },
        {
          episodeId: episodeIds[1],
          position: 1,
          status: 'pending',
        },
      ],
    });
  });

  test('should return 404 when focus session does not exist', async () => {
    const response = await request(app.getHttpServer())
      .post(`/focus-sessions/${randomUUID()}/items/${episodeIds[0]}/skip`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);

    expect(response.body.message).toEqual('Focus session not found');
  });

  test('should return 404 when item does not belong to the session', async () => {
    const response = await request(app.getHttpServer())
      .post(`/focus-sessions/${sessionId}/items/${randomUUID()}/skip`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);

    expect(response.body.message).toEqual('Focus session item not found');
  });

  test('should return 400 when session is finished', async () => {
    await prisma.focusSession.update({
      where: { id: sessionId },
      data: { status: 'finished', finishedAt: new Date() },
    });

    const response = await request(app.getHttpServer())
      .post(`/focus-sessions/${sessionId}/items/${episodeIds[0]}/skip`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);

    expect(response.body.message).toEqual('Focus session is not in progress');
  });

  test('should return 401 when the authorization header is missing', async () => {
    const response = await request(app.getHttpServer())
      .post(`/focus-sessions/${sessionId}/items/${episodeIds[0]}/skip`)
      .expect(401);

    expect(response.body.message).toBe('Unauthorized');

    const sessionOnDatabase = await prisma.focusSession.findUnique({
      where: { id: sessionId },
      include: { items: { orderBy: { position: 'asc' } } },
    });
    expect(sessionOnDatabase).toMatchObject({ currentIndex: 0 });
    expect(sessionOnDatabase?.items[0]).toMatchObject({ status: 'pending' });
  });

  test('should return 404 when the focus session belongs to another user', async () => {
    const response = await request(app.getHttpServer())
      .post(`/focus-sessions/${sessionId}/items/${episodeIds[0]}/skip`)
      .set('Authorization', `Bearer ${otherUserAccessToken}`)
      .expect(404);

    expect(response.body.message).toEqual('Focus session not found');

    const sessionOnDatabase = await prisma.focusSession.findUnique({
      where: { id: sessionId },
      include: { items: { orderBy: { position: 'asc' } } },
    });
    expect(sessionOnDatabase).toMatchObject({ currentIndex: 0 });
    expect(sessionOnDatabase?.items[0]).toMatchObject({ status: 'pending' });
  });
});
