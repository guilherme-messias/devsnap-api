import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@src/app.module';
import { randomUUID } from 'crypto';
import { Episode, Stack } from '@prisma/client';

describe('Create Annotations (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let episode: Episode;
  let stack: Stack;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);

    await app.init();

    stack = await prisma.stack.create({
      data: {
        id: randomUUID() as string,
        name: 'Stack 1',
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
  });
  afterEach(async () => {
    await prisma.episode.deleteMany();
    await prisma.stack.deleteMany();
    await prisma.annotation.deleteMany();
  });
  afterAll(async () => {
    await app.close();
  });
  test('should create an annotation when payload is valid', async () => {
    const response = await request(app.getHttpServer())
      .post(`/episodes/${episode.id}/annotations`)
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
  /* test('should return 400 when payload is invalid', async () => {
    const response = await request(app.getHttpServer())
      .post('/episodes/123/annotations')
      .send({ text: '' })
      .expect(400);
    expect(response.body).toEqual({
      message: 'Validation failed',
      errors: [{ field: 'text', message: 'Text is required' }],
    });
  });
  test('should return 404 when episode is not found', async () => {
    const response = await request(app.getHttpServer())
      .post('/episodes/1234/annotations')
      .send({ text: 'Annotation 1' })
      .expect(404);
    expect(response.body).toEqual({
      message: 'Episode not found',
    });
  });
  test('should return 400 when payload is missing', async () => {
    const response = await request(app.getHttpServer())
      .post('/episodes/123/annotations')
      .send({})
      .expect(400);
    expect(response.body).toEqual({
      message: 'Validation failed',
    });
  }); */
});
