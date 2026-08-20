import { INestApplication } from "@nestjs/common";
import { PrismaService } from "../src/prisma/prisma.service";
import { AppModule } from "../src/app.module";
import { Test } from '@nestjs/testing';
import request from 'supertest';

describe('Update Episode (E2E)', () => {
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

  test('should update an episode when payload is valid', async () => {
    const episode = await prisma.episode.create({
      data: {
        title: 'Test Episode',
        stack: 'Node.js',
        error: 'Some error',
        solution: 'Some solution',
      },
    });

    const response = await request(app.getHttpServer())
      .put(`/episodes/${episode.id}`)
      .send({
        title: 'Updated Episode',
        stack: 'Node.js',
        error: 'Updated error',
        solution: 'Updated solution',
      })
      .expect(200);

    expect(response.body).toHaveProperty('episode');
    expect(response.body.episode.title).toEqual('Updated Episode');
    expect(response.body.episode.error).toEqual('Updated error');
    expect(response.body.episode.solution).toEqual('Updated solution');
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
      .put(`/episodes/${episode.id}`)
      .send({
        title: 123,
      })
      .expect(400);

    expect(response.body.message).toEqual('Validation failed');
  });

  test('should return 404 when episode does not exist', async () => {
    const nonExistingId = '00000000-0000-0000-0000-000000000000';

    const response = await request(app.getHttpServer())
      .put(`/episodes/${nonExistingId}`)
      .send({
        title: 'Updated Episode',
        stack: 'Node.js',
        error: 'Updated error',
        solution: 'Updated solution',
      })
      .expect(404);

    expect(response.body).toHaveProperty('statusCode', 404);
    expect(response.body).toHaveProperty(
      'message',
      `Episode with ID ${nonExistingId} not found`,
    );
  });
});
