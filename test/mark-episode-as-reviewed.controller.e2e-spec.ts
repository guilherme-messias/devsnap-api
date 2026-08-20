import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import request from 'supertest';

describe('Mark Episode as Reviewed (E2E)', () => {
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
    await prisma.episode.deleteMany({});
    await app.close();
  });

  test('should mark an episode as reviewed when payload is valid', async () => {
    const episode = await prisma.episode.create({
      data: {
        title: 'Test Episode',
        stack: 'Node.js',
        error: 'Some error',
        solution: 'Some solution',
      },
    });

    const response = await request(app.getHttpServer())
      .patch(`/episodes/${episode.id}/reviewed/true`)
      .expect(200);

    expect(response.body).toHaveProperty('episode');
    expect(response.body.episode.reviewed).toEqual(true);
  });

  test('should return 404 when episode does not exist', async () => {
    const nonExistingId = '00000000-0000-0000-0000-000000000000';

    const response = await request(app.getHttpServer())
      .patch(`/episodes/${nonExistingId}/reviewed/true`)
      .expect(404);

    expect(response.body).toHaveProperty('statusCode', 404);
    expect(response.body).toHaveProperty(
      'message',
      `Episode with ID ${nonExistingId} not found`,
    );
  });

  test('should return 400 when payload is invalid', async () => {
    const episode = await prisma.episode.create({
      data: {
        title: 'Test Episode',
        stack: 'Node.js',
        error: 'Some error',
        solution: 'Some solution',
      },
    });

    const response = await request(app.getHttpServer())
      .patch(`/episodes/${episode.id}/reviewed/invalid`)
      .expect(400);

    expect(response.body.message).toEqual(
      'Validation failed (boolean string is expected)',
    );
  });
});
