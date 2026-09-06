import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import request from 'supertest';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';
import { randomUUID } from 'crypto';
import { createTestUser } from '../helpers/create-test-user';

describe('Create Focus Session (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let stackId: string;
  let episodeIds: string[];

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

  afterEach(async () => {
    await prisma.focusSessionItem.deleteMany();
    await prisma.focusSession.deleteMany();
  });

  afterAll(async () => {
    await prisma.episode.deleteMany();
    await prisma.stack.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  test('should create a focus session when payload is valid', async () => {
    const response = await request(app.getHttpServer())
      .post('/focus-sessions')
      .send({ stackId })
      .expect(201);

    expect(response.body).toEqual({
      id: expect.any(String),
      stackId,
      status: 'in_progress',
      startedAt: expect.any(String),
      currentIndex: 0,
      items: expect.arrayContaining([
        {
          episodeId: episodeIds[0],
          position: expect.any(Number),
          status: 'pending',
        },
        {
          episodeId: episodeIds[1],
          position: expect.any(Number),
          status: 'pending',
        },
      ]),
    });
    expect(response.body.items).toHaveLength(2);
    expect(response.body.items.map((item: { position: number }) => item.position).sort()).toEqual([
      0, 1,
    ]);
  });

  test('should return 400 when stack has no episodes', async () => {
    const { user } = await createTestUser(prisma, '12345678');
    const emptyStack = await prisma.stack.create({
      data: { name: 'Empty', userId: user.id },
    });

    const response = await request(app.getHttpServer())
      .post('/focus-sessions')
      .send({ stackId: emptyStack.id })
      .expect(400);

    expect(response.body.message).toEqual('Stack has no episodes');
  });

  test('should return 400 when payload is invalid', async () => {
    const response = await request(app.getHttpServer())
      .post('/focus-sessions')
      .send({})
      .expect(400);

    expect(response.body.message).toContain('Validation failed');
  });

  test('should return 404 when stack does not exist', async () => {
    const response = await request(app.getHttpServer())
      .post('/focus-sessions')
      .send({ stackId: randomUUID() })
      .expect(404);

    expect(response.body.message).toEqual('Stack not found');
  });
});
