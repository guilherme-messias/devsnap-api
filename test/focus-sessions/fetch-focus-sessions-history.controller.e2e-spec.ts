import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import request from 'supertest';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';
import { createTestUser } from '../helpers/create-test-user';
import { authenticateTestUser } from '../helpers/authenticate-test-user';

describe('Fetch Focus Sessions History (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let stackId: string;
  let episodeId: string;
  let finishedSessionId: string;
  let accessToken: string;
  let otherUserAccessToken: string;
  let otherUserFinishedSessionId: string;
  let otherUserStackId: string;
  let otherUserEpisodeId: string;

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

    const otherUserStack = await prisma.stack.create({
      data: { name: 'React', userId: otherUser.id },
    });
    otherUserStackId = otherUserStack.id;

    const otherUserEpisode = await prisma.episode.create({
      data: {
        title: 'Other Episode 1',
        stackId: otherUserStackId,
        error: 'Other Error 1',
        solution: 'Other Solution 1',
      },
    });
    otherUserEpisodeId = otherUserEpisode.id;

    const otherUserFinishedSession = await prisma.focusSession.create({
      data: {
        stackId: otherUserStackId,
        status: 'finished',
        currentIndex: 1,
        finishedAt: new Date(),
        items: {
          create: [
            {
              episodeId: otherUserEpisodeId,
              position: 0,
              status: 'reviewed',
            },
          ],
        },
      },
    });
    otherUserFinishedSessionId = otherUserFinishedSession.id;
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
      .set('Authorization', `Bearer ${accessToken}`)
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
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);

    expect(response.body.message).toContain('Validation failed');
  });

  test('should return 401 when the authorization header is missing', async () => {
    const response = await request(app.getHttpServer())
      .get('/focus-sessions/history')
      .expect(401);

    expect(response.body.message).toBe('Unauthorized');
  });

  test('should return only the focus sessions of the authenticated user', async () => {
    const response = await request(app.getHttpServer())
      .get('/focus-sessions/history')
      .set('Authorization', `Bearer ${otherUserAccessToken}`)
      .expect(200);

    expect(response.body.focusSessions).toHaveLength(1);
    expect(response.body.focusSessions[0]).toEqual({
      id: otherUserFinishedSessionId,
      stackId: otherUserStackId,
      status: 'finished',
      startedAt: expect.any(String),
      currentIndex: 1,
      items: [
        {
          episodeId: otherUserEpisodeId,
          position: 0,
          status: 'reviewed',
        },
      ],
    });

    expect(
      response.body.focusSessions.map((session: { id: string }) => session.id),
    ).not.toContain(finishedSessionId);
  });
});
