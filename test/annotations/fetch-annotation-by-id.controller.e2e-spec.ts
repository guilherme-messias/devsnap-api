import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';
import request from 'supertest';

describe('Fetch Annotation By Id (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let stackId: string;
  let episodeId: string;
  let annotationId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService);

    await app.init();

    const stack = await prisma.stack.create({ data: { name: 'Node.js' } });
    stackId = stack.id;

    const episode = await prisma.episode.create({
      data: {
        title: 'Episode 1',
        error: 'Error 1',
        solution: 'Solution 1',
        stackId: stackId,
      },
    });
    episodeId = episode.id;

    const annotation = await prisma.annotation.create({
      data: { episodeId: episodeId, text: 'Annotation 1 text' },
    });
    annotationId = annotation.id;
  });

  afterAll(async () => {
    await prisma.annotation.deleteMany({});
    await prisma.episode.deleteMany({});
    await prisma.stack.deleteMany({});
    await app.close();
  });
  test('should fetch an annotation by id', async () => {
    const response = await request(app.getHttpServer())
      .get(`/episodes/${episodeId}/annotations/${annotationId}`)
      .expect(200);
    expect(response.body).toEqual({
      annotation: {
        id: annotationId,
        text: 'Annotation 1 text',
        episodeId: episodeId,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
    });
  });
  test('should return 404 for non-existing annotation id', async () => {
    const nonExistingId = '00000000-0000-0000-0000-000000000000';
    const response = await request(app.getHttpServer())
      .get(`/episodes/${episodeId}/annotations/${nonExistingId}`)
      .expect(404);
    expect(response.body).toHaveProperty('statusCode', 404);
    expect(response.body).toHaveProperty(
      'message',
      'Annotation or episode not found',
    );
  });
  test('should return 404 for non-existing episode id', async () => {
    const nonExistingId = '00000000-0000-0000-0000-000000000000';
    const response = await request(app.getHttpServer())
      .get(`/episodes/${nonExistingId}/annotations/${annotationId}`)
      .expect(404);
    expect(response.body).toHaveProperty('statusCode', 404);
    expect(response.body).toHaveProperty(
      'message',
      'Annotation or episode not found',
    );
  });
  test('should return 400 for invalid annotation id', async () => {
    const invalidId = 'invalid-uuid';
    const response = await request(app.getHttpServer())
      .get(`/episodes/${episodeId}/annotations/${invalidId}`)
      .expect(400);
    expect(response.body).toHaveProperty('statusCode', 400);
    expect(response.body).toHaveProperty('message', 'Validation failed');
  });
  test('should return 400 for invalid episode id', async () => {
    const invalidId = 'invalid-uuid';
    const response = await request(app.getHttpServer())
      .get(`/episodes/${invalidId}/annotations/${annotationId}`)
      .expect(400);
    expect(response.body).toHaveProperty('statusCode', 400);
    expect(response.body).toHaveProperty('message', 'Validation failed');
  });
});
