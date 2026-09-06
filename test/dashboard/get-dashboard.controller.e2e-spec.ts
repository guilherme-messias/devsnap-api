import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import request from 'supertest';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';
import { createTestUser } from '../helpers/create-test-user';

describe('Get Dashboard (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

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
  });

  test('should return empty dashboard when there is no data', async () => {
    const response = await request(app.getHttpServer())
      .get('/dashboard')
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
    const { user } = await createTestUser(prisma);

    const angular = await prisma.stack.create({
      data: { name: 'Angular', userId: user.id },
    });
    const nest = await prisma.stack.create({
      data: { name: 'NestJS', userId: user.id },
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
    const { user } = await createTestUser(prisma);

    const emptyStack = await prisma.stack.create({
      data: { name: 'Empty', userId: user.id },
    });

    const response = await request(app.getHttpServer())
      .get('/dashboard')
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
});
