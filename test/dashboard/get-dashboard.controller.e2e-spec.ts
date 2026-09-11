import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@app';
import request from 'supertest';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { createTestUser } from '../helpers/create-test-user';
import { authenticateTestUser } from '../helpers/authenticate-test-user';

describe('Get Dashboard (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userId: string;
  let accessToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await prisma.episodeReview.deleteMany();
    await prisma.episode.deleteMany();
    await prisma.stack.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  beforeEach(async () => {
    await prisma.episodeReview.deleteMany();
    await prisma.episode.deleteMany();
    await prisma.stack.deleteMany();
    await prisma.user.deleteMany();

    const { user, password } = await createTestUser(prisma);
    userId = user.id;

    const authentication = await authenticateTestUser(
      app,
      user.email,
      password,
    );
    accessToken = authentication.accessToken;
  });

  test('should return empty dashboard when there is no data', async () => {
    const response = await request(app.getHttpServer())
      .get('/dashboard')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toEqual({
      totals: {
        stacks: 0,
        episodes: 0,
        pending: 0,
        reviewed: 0,
        overdue: 0,
      },
      stacks: [],
    });
  });

  test('should return dashboard totals and stack progress', async () => {
    const angular = await prisma.stack.create({
      data: { name: 'Angular', userId },
    });
    const nest = await prisma.stack.create({
      data: { name: 'NestJS', userId },
    });

    const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    const reviewedEpisode = await prisma.episode.create({
      data: {
        title: 'Reviewed',
        error: 'err',
        solution: 'sol',
        stackId: angular.id,
        createdAt: eightDaysAgo,
      },
    });
    await prisma.episodeReview.create({
      data: {
        episodeId: reviewedEpisode.id,
        result: 'remembered',
      },
    });

    await prisma.episode.create({
      data: {
        title: 'Pending recent',
        error: 'err',
        solution: 'sol',
        stackId: angular.id,
        createdAt: twoDaysAgo,
      },
    });

    await prisma.episode.create({
      data: {
        title: 'Overdue pending',
        error: 'err',
        solution: 'sol',
        stackId: angular.id,
        createdAt: eightDaysAgo,
      },
    });

    await prisma.episode.create({
      data: {
        title: 'Nest pending',
        error: 'err',
        solution: 'sol',
        stackId: nest.id,
        createdAt: twoDaysAgo,
      },
    });

    const response = await request(app.getHttpServer())
      .get('/dashboard')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.totals).toEqual({
      stacks: 2,
      episodes: 4,
      pending: 3,
      reviewed: 1,
      overdue: 1,
    });

    expect(response.body.stacks).toEqual(
      expect.arrayContaining([
        {
          id: angular.id,
          name: 'Angular',
          episodeCount: 3,
          pendingCount: 2,
          reviewedCount: 1,
          overdueCount: 1,
          progressPercentage: 33.33,
        },
        {
          id: nest.id,
          name: 'NestJS',
          episodeCount: 1,
          pendingCount: 1,
          reviewedCount: 0,
          overdueCount: 0,
          progressPercentage: 0,
        },
      ]),
    );
  });

  test('should return 0 progressPercentage when stack has no episodes', async () => {
    const emptyStack = await prisma.stack.create({
      data: { name: 'Empty', userId },
    });

    const response = await request(app.getHttpServer())
      .get('/dashboard')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toEqual({
      totals: {
        stacks: 1,
        episodes: 0,
        pending: 0,
        reviewed: 0,
        overdue: 0,
      },
      stacks: [
        {
          id: emptyStack.id,
          name: 'Empty',
          episodeCount: 0,
          pendingCount: 0,
          reviewedCount: 0,
          overdueCount: 0,
          progressPercentage: 0,
        },
      ],
    });
  });

  test('should not include data that belongs to another user', async () => {
    const ownStack = await prisma.stack.create({
      data: { name: 'Own', userId },
    });

    const { user: otherUser } = await createTestUser(prisma);
    const otherStack = await prisma.stack.create({
      data: { name: 'Other', userId: otherUser.id },
    });
    await prisma.episode.create({
      data: {
        title: 'Other episode',
        error: 'err',
        solution: 'sol',
        stackId: otherStack.id,
      },
    });

    const response = await request(app.getHttpServer())
      .get('/dashboard')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.totals).toEqual({
      stacks: 1,
      episodes: 0,
      pending: 0,
      reviewed: 0,
      overdue: 0,
    });
    expect(response.body.stacks).toHaveLength(1);
    expect(response.body.stacks[0].id).toBe(ownStack.id);
  });

  test('should return new dashboard when the data is changed', async () => {
    await prisma.stack.create({ data: { name: 'A', userId } });
    const first = await request(app.getHttpServer())
      .get('/dashboard')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(first.body.totals.stacks).toBe(1);

    await request(app.getHttpServer())
      .delete(`/stacks/${first.body.stacks[0].id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);

    const second = await request(app.getHttpServer())
      .get('/dashboard')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(second.body.totals.stacks).toBe(1);
  });

  test('should keep serving cached dashboard when data changes outside the API ', async () => {
    await prisma.stack.create({ data: { name: 'A', userId } });
    const first = await request(app.getHttpServer())
      .get('/dashboard')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(first.body.totals.stacks).toBe(1);

    await prisma.stack.create({ data: { name: 'B', userId } });
    const second = await request(app.getHttpServer())
      .get('/dashboard')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(second.body.totals.stacks).toBe(1);
  });

  test('should return 401 when the authorization header is missing', async () => {
    const response = await request(app.getHttpServer())
      .get('/dashboard')
      .expect(401);

    expect(response.body.message).toBe('Unauthorized');
  });
});
