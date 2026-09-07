import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@src/app.module';
import { randomUUID } from 'crypto';
import { Episode, Stack } from '@prisma/client';
import { createTestUser } from '../helpers/create-test-user';
import { authenticateTestUser } from '../helpers/authenticate-test-user';

describe('Create Annotation (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let episode: Episode;
  let stack: Stack;
  let accessToken: string;
  let otherAccessToken: string;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);

    await app.init();

    const { user, password } = await createTestUser(prisma);

    stack = await prisma.stack.create({
      data: {
        id: randomUUID() as string,
        name: 'Stack 1',
        userId: user.id,
      },
    });

    episode = await prisma.episode.create({
      data: {
        id: randomUUID() as string,
        title: 'Episode 1',
        error: 'Error 1',
        solution: 'Solution 1',
        stackId: stack.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const authenticated = await authenticateTestUser(app, user.email, password);
    accessToken = authenticated.accessToken;

    const { user: otherUser, password: otherPassword } =
      await createTestUser(prisma);

    const otherStack = await prisma.stack.create({
      data: {
        name: 'Stack 2',
        userId: otherUser.id,
      },
    });

    await prisma.episode.create({
      data: {
        title: 'Episode 2',
        error: 'Error 2',
        solution: 'Solution 2',
        stackId: otherStack.id,
      },
    });

    const otherAuthenticated = await authenticateTestUser(
      app,
      otherUser.email,
      otherPassword,
    );
    otherAccessToken = otherAuthenticated.accessToken;
  });

  afterAll(async () => {
    await prisma.annotation.deleteMany();
    await prisma.episode.deleteMany();
    await prisma.stack.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });
  test('should create an annotation when payload is valid', async () => {
    const response = await request(app.getHttpServer())
      .post(`/episodes/${episode.id}/annotations`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ text: 'Annotation 1' })
      .expect(201);
    expect(response.body).toEqual({
      id: expect.any(String),
      text: 'Annotation 1',
      episodeId: episode.id,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });
  test('should return 400 when payload is invalid', async () => {
    const response = await request(app.getHttpServer())
      .post(`/episodes/${episode.id}/annotations`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ text: '' })
      .expect(400);
    expect(response.body.message).toEqual('Validation failed');
  });
  test('should return 404 when episode is not found', async () => {
    const response = await request(app.getHttpServer())
      .post(`/episodes/${randomUUID()}/annotations`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ text: 'Annotation 1' })
      .expect(404);
    expect(response.body.message).toEqual('Episode not found');
  });
  test('should return 400 when payload is missing', async () => {
    const response = await request(app.getHttpServer())
      .post(`/episodes/${episode.id}/annotations`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})
      .expect(400);
    expect(response.body.message).toEqual('Validation failed');
  });

  test('should return 400 when episodeId is not a uuid', async () => {
    const response = await request(app.getHttpServer())
      .post(`/episodes/${'invalid-uuid'}/annotations`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ text: 'Annotation 1' })
      .expect(400);
    expect(response.body.message).toEqual('Validation failed');
  });

  test('should return 400 when text is more than 1000 characters', async () => {
    const response = await request(app.getHttpServer())
      .post(`/episodes/${episode.id}/annotations`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ text: 'a'.repeat(1001) })
      .expect(400);
    expect(response.body.message).toEqual('Validation failed');
  });

  test('should return 401 when the authorization header is missing', async () => {
    const response = await request(app.getHttpServer())
      .post(`/episodes/${episode.id}/annotations`)
      .send({ text: 'Annotation 1' })
      .expect(401);
    expect(response.body.message).toBe('Unauthorized');
  });

  test('should return 404 when the episode belongs to another user', async () => {
    const response = await request(app.getHttpServer())
      .post(`/episodes/${episode.id}/annotations`)
      .set('Authorization', `Bearer ${otherAccessToken}`)
      .send({ text: 'Annotation from another user' })
      .expect(404);
    expect(response.body.message).toEqual('Episode not found');

    const annotations = await prisma.annotation.findMany({
      where: { episodeId: episode.id, text: 'Annotation from another user' },
    });
    expect(annotations).toHaveLength(0);
  });
});
