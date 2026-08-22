import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { Test } from '@nestjs/testing';

describe('Fetch Episode By Id (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let stackId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService);

    await app.init();

    const stack = await prisma.stack.create({ data: { name: 'Node.js' } });
    stackId = stack.id;
  });

  afterAll(async () => {
    await prisma.episode.deleteMany({});
    await prisma.stack.deleteMany({});
    await app.close();
  });

  test('should return the episode by id', async () => {
    const episode = await prisma.episode.create({
      data: {
        title: 'Test Episode',
        stackId,
        error: 'Some error',
        solution: 'Some solution',
        annotations: { create: [{ text: 'Investigation note' }] },
      },
    });

    const response = await request(app.getHttpServer())
      .get(`/episodes/${episode.id}`)
      .expect(200);

    expect(response.body).toHaveProperty('episode');
    expect(response.body.episode).toHaveProperty('id', episode.id);
    expect(response.body.episode).toHaveProperty('title', episode.title);
    expect(response.body.episode).toHaveProperty('stackId', stackId);
    expect(response.body.episode.stack).toMatchObject({
      id: stackId,
      name: 'Node.js',
    });
    expect(response.body.episode).toHaveProperty('error', episode.error);
    expect(response.body.episode).toHaveProperty('solution', episode.solution);
    expect(response.body.episode.annotations).toEqual([
      expect.objectContaining({
        text: 'Investigation note',
        episodeId: episode.id,
      }),
    ]);
  });

  test('should return 404 for non-existing episode id', async () => {
    const nonExistingId = '00000000-0000-0000-0000-000000000000';

    const response = await request(app.getHttpServer())
      .get(`/episodes/${nonExistingId}`)
      .expect(404);

    expect(response.body).toHaveProperty('statusCode', 404);
    expect(response.body).toHaveProperty(
      'message',
      `Episode with ID ${nonExistingId} not found`,
    );
  });

  test('should return 400 for invalid episode id', async () => {
    const invalidId = 'invalid-uuid';

    const response = await request(app.getHttpServer())
      .get(`/episodes/${invalidId}`)
      .expect(400);

    expect(response.body).toHaveProperty('statusCode', 400);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Validation failed');
  });
});
