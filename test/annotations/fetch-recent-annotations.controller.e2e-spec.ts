import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';
import request from 'supertest';
import { createTestUser } from '../helpers/create-test-user';

describe('Fetch Recent Annotations (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let stackId: string;
  let episodeId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService);

    await app.init();

    const user = await createTestUser(prisma);
    const stack = await prisma.stack.create({
      data: { name: 'Node.js', userId: user.id },
    });
    stackId = stack.id;

    const episode = await prisma.episode.create({
      data: {
        title: 'Test Episode',
        stackId,
        error: 'Some error',
        solution: 'Some solution',
      },
    });
    episodeId = episode.id;
    await prisma.annotation.create({
      data: {
        text: 'Test Annotation',
        episodeId,
      },
    });

    await prisma.annotation.create({
      data: {
        text: 'Another Test Annotation',
        episodeId,
      },
    });
  });

  afterAll(async () => {
    await prisma.annotation.deleteMany({});
    await prisma.episode.deleteMany({});
    await prisma.stack.deleteMany({});
    await prisma.user.deleteMany();
    await app.close();
  });

  test('should return the most recent annotation', async () => {
    const response = await request(app.getHttpServer())
      .get(`/episodes/${episodeId}/annotations?page=1`)
      .expect(200);

    expect(response.body.annotations).toBeInstanceOf(Array);
    expect(response.body.annotations.length).toBe(1);
    expect(response.body.annotations[0].text).toBe('Another Test Annotation');
  });

  test('should paginate correctly when page=2', async () => {
    const response = await request(app.getHttpServer())
      .get(`/episodes/${episodeId}/annotations?page=2`)
      .expect(200);

    expect(response.body.annotations).toBeInstanceOf(Array);
    expect(response.body.annotations.length).toBe(1);
    expect(response.body.annotations[0].text).toBe('Test Annotation');
  });

  test('should default to page 1 when page is not provided', async () => {
    const response = await request(app.getHttpServer())
      .get(`/episodes/${episodeId}/annotations`)
      .expect(200);

    expect(response.body.annotations).toBeInstanceOf(Array);
    expect(response.body.annotations.length).toBe(1);
    expect(response.body.annotations[0].text).toBe('Another Test Annotation');
  });

  test('should return annotations in expected response shape', async () => {
    const response = await request(app.getHttpServer())
      .get(`/episodes/${episodeId}/annotations?page=1`)
      .expect(200);

    expect(response.body).toHaveProperty('annotations');
    expect(response.body.annotations[0]).toHaveProperty('id');
    expect(response.body.annotations[0]).toHaveProperty('text');
    expect(response.body.annotations[0]).toHaveProperty('episodeId');
    expect(response.body.annotations[0]).toHaveProperty('createdAt');
    expect(response.body.annotations[0]).toHaveProperty('updatedAt');
  });

  test('should return 200 with empty annotations array when there are no annotations', async () => {
    await prisma.annotation.deleteMany({ where: { episodeId } });

    const response = await request(app.getHttpServer())
      .get(`/episodes/${episodeId}/annotations?page=3`)
      .expect(200);

    expect(response.body.annotations).toBeInstanceOf(Array);
    expect(response.body.annotations.length).toBe(0);
  });

  test('should return 400 when page is less than 1', async () => {
    const response = await request(app.getHttpServer())
      .get(`/episodes/${episodeId}/annotations?page=0`)
      .expect(400);

    expect(response.body.message).toEqual('Validation failed');
  });

  test('should return 400 when page is not a integer', async () => {
    const response = await request(app.getHttpServer())
      .get(`/episodes/${episodeId}/annotations?page=abc`)
      .expect(400);

    expect(response.body.message).toEqual('Validation failed');
  });

  test('should return 400 when page is not a number', async () => {
    const response = await request(app.getHttpServer())
      .get(`/episodes/${episodeId}/annotations?page=1.5`)
      .expect(400);

    expect(response.body.message).toEqual('Validation failed');
  });

  test('should return an empty array when the page exceeds available annotations', async () => {
    const response = await request(app.getHttpServer())
      .get(`/episodes/${episodeId}/annotations?page=100`)
      .expect(200);

    expect(response.body.annotations).toBeInstanceOf(Array);
    expect(response.body.annotations.length).toBe(0);
  });

  test('should return 404 when episode is not found', async () => {
    const response = await request(app.getHttpServer())
      .get(
        `/episodes/${'00000000-0000-0000-0000-000000000000'}/annotations?page=1`,
      )
      .expect(404);

    expect(response.body.message).toEqual('Episode not found');
  });
});
