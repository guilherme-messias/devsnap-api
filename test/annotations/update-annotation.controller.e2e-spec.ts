import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';
import request from 'supertest';
import { createTestUser } from '../helpers/create-test-user';

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

    const { user } = await createTestUser(prisma, '12345678');
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

    expect(response.body.annotation.id).toBe(annotationId);
    expect(response.body.annotation.episodeId).toBe(episodeId);
    expect(response.body.annotation.text).toBe('Updated Annotation');
  });

  test('should return 400 when payload is missing', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/episodes/${episodeId}/annotations/${annotationId}`)
      .send({})
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
      `Annotation or episode not found`,
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
      `Annotation or episode not found`,
    );
  });

  test('should return 400 when episodeId is not a uuid', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/episodes/${'invalid-uuid'}/annotations/${annotationId}`)
      .send({ text: 'Updated Annotation' })
      .expect(400);
    expect(response.body.message).toEqual('Validation failed');
  });

  test('should return 400 when annotationId is not a uuid', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/episodes/${episodeId}/annotations/${'invalid-uuid'}`)
      .send({ text: 'Updated Annotation' })
      .expect(400);
    expect(response.body.message).toEqual('Validation failed');
  });

  test('should return 400 when text is more than 1000 characters', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/episodes/${episodeId}/annotations/${annotationId}`)
      .send({ text: 'a'.repeat(1001) })
      .expect(400);
    expect(response.body.message).toEqual('Validation failed');
  });

  test('should return 400 when text is empty', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/episodes/${episodeId}/annotations/${annotationId}`)
      .send({ text: '' })
      .expect(400);
    expect(response.body.message).toEqual('Validation failed');
  });
});
