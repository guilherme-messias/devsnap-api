import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';
import request from 'supertest';

describe('Update Annotation (E2E)', () => {
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
        title: 'Test Episode',
        stackId,
        error: 'Some error',
        solution: 'Some solution',
      },
    });
    episodeId = episode.id;

    const annotation = await prisma.annotation.create({
      data: {
        text: 'Test Annotation',
        episodeId,
      },
    });
    annotationId = annotation.id;
  });

  afterAll(async () => {
    await app.close();
  });

  test('should update an annotation when payload is valid', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/episodes/${episodeId}/annotations/${annotationId}`)
      .send({ text: 'Updated Annotation' })
      .expect(200);

    expect(response.body.text).toBe('Updated Annotation');
    expect(response.body.episodeId).toBe(episodeId);
  });

  test('should return 400 when payload is invalid', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/episodes/${episodeId}/annotations/${annotationId}`)
      .send({ text: '' })
      .expect(400);

    expect(response.body.message).toEqual('Validation failed');
  });

  test('should return 404 when episode does not exist', async () => {
    const nonExistingEpisodeId = '00000000-0000-0000-0000-000000000000';

    const response = await request(app.getHttpServer())
      .patch(`/episodes/${nonExistingEpisodeId}/annotations/${annotationId}`)
      .send({ text: 'Updated Annotation' })
      .expect(404);

    expect(response.body).toHaveProperty('statusCode', 404);
    expect(response.body).toHaveProperty(
      'message',
      `Annotation with ID ${annotationId} or episode with ID ${nonExistingEpisodeId} not found`,
    );
  });

  test('should return 404 when annotation does not exist', async () => {
    const nonExistingAnnotationId = '00000000-0000-0000-0000-000000000000';

    const response = await request(app.getHttpServer())
      .patch(`/episodes/${episodeId}/annotations/${nonExistingAnnotationId}`)
      .send({ text: 'Updated Annotation' })
      .expect(404);

    expect(response.body).toHaveProperty('statusCode', 404);
    expect(response.body).toHaveProperty(
      'message',
      `Annotation with ID ${nonExistingAnnotationId} or episode with ID ${episodeId} not found`,
    );
  });

  test('should return 400 when text is empty', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/episodes/${episodeId}/annotations/${annotationId}`)
      .send({ text: '' })
      .expect(400);

    expect(response.body).toHaveProperty('statusCode', 400);
    expect(response.body).toHaveProperty('message', 'Validation failed');
  });
});
