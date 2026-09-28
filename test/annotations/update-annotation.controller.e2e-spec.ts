import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@app';
import { CacheRepository } from '@infrastructure/cache/cache-repository';
import { InMemoryCacheRepository } from '@infrastructure/cache/in-memory/in-memory-cache.repository';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import request from 'supertest';
import { createTestUser } from '../helpers/create-test-user';
import { authenticateTestUser } from '../helpers/authenticate-test-user';
import { getAppServer } from '../helpers/http-server';
import { bodyOf } from '../helpers/body-of';

describe('Update Annotation (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cache: InMemoryCacheRepository;
  let stackId: string;
  let episodeId: string;
  let annotationId: string;
  let accessToken: string;
  let otherAccessToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CacheRepository)
      .useClass(InMemoryCacheRepository)
      .compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService);
    cache = moduleRef.get<InMemoryCacheRepository>(CacheRepository);

    await app.init();

    const { user, password } = await createTestUser(prisma);
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

    const authenticated = await authenticateTestUser(app, user.email, password);
    accessToken = authenticated.accessToken;

    const { user: otherUser, password: otherPassword } =
      await createTestUser(prisma);
    const otherStack = await prisma.stack.create({
      data: { name: 'Deno', userId: otherUser.id },
    });

    await prisma.episode.create({
      data: {
        title: 'Other Test Episode',
        stackId: otherStack.id,
        error: 'Other error',
        solution: 'Other solution',
      },
    });

    const otherAuthenticated = await authenticateTestUser(
      app,
      otherUser.email,
      otherPassword,
    );
    otherAccessToken = otherAuthenticated.accessToken;
  });

  beforeEach(() => {
    cache.clear();
  });

  afterAll(async () => {
    await prisma.annotation.deleteMany({});
    await prisma.episode.deleteMany({});
    await prisma.stack.deleteMany({});
    await prisma.user.deleteMany();
    await app.close();
  });

  test('should update an annotation when payload is valid', async () => {
    const response = await request(getAppServer(app))
      .patch(`/episodes/${episodeId}/annotations/${annotationId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ text: 'Updated Annotation' })
      .expect(200);

    expect(bodyOf(response).annotation.id).toBe(annotationId);
    expect(bodyOf(response).annotation.episodeId).toBe(episodeId);
    expect(bodyOf(response).annotation.text).toBe('Updated Annotation');
  });

  test('should return 400 when payload is missing', async () => {
    const response = await request(getAppServer(app))
      .patch(`/episodes/${episodeId}/annotations/${annotationId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})
      .expect(400);

    expect(bodyOf(response).message).toEqual('Validation failed');
  });

  test('should return 404 when episode does not exist', async () => {
    const nonExistingEpisodeId = '00000000-0000-0000-0000-000000000000';

    const response = await request(getAppServer(app))
      .patch(`/episodes/${nonExistingEpisodeId}/annotations/${annotationId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ text: 'Updated Annotation' })
      .expect(404);

    expect(bodyOf(response)).toHaveProperty('statusCode', 404);
    expect(bodyOf(response)).toHaveProperty(
      'message',
      `Annotation or episode not found`,
    );
  });

  test('should return 404 when annotation does not exist', async () => {
    const nonExistingAnnotationId = '00000000-0000-0000-0000-000000000000';

    const response = await request(getAppServer(app))
      .patch(`/episodes/${episodeId}/annotations/${nonExistingAnnotationId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ text: 'Updated Annotation' })
      .expect(404);

    expect(bodyOf(response)).toHaveProperty('statusCode', 404);
    expect(bodyOf(response)).toHaveProperty(
      'message',
      `Annotation or episode not found`,
    );
  });

  test('should return 400 when episodeId is not a uuid', async () => {
    const response = await request(getAppServer(app))
      .patch(`/episodes/${'invalid-uuid'}/annotations/${annotationId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ text: 'Updated Annotation' })
      .expect(400);
    expect(bodyOf(response).message).toEqual('Validation failed');
  });

  test('should return 400 when annotationId is not a uuid', async () => {
    const response = await request(getAppServer(app))
      .patch(`/episodes/${episodeId}/annotations/${'invalid-uuid'}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ text: 'Updated Annotation' })
      .expect(400);
    expect(bodyOf(response).message).toEqual('Validation failed');
  });

  test('should return 400 when text is more than 1000 characters', async () => {
    const response = await request(getAppServer(app))
      .patch(`/episodes/${episodeId}/annotations/${annotationId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ text: 'a'.repeat(1001) })
      .expect(400);
    expect(bodyOf(response).message).toEqual('Validation failed');
  });

  test('should return 400 when text is empty', async () => {
    const response = await request(getAppServer(app))
      .patch(`/episodes/${episodeId}/annotations/${annotationId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ text: '' })
      .expect(400);
    expect(bodyOf(response).message).toEqual('Validation failed');
  });

  test('should return 401 when the authorization header is missing', async () => {
    const response = await request(getAppServer(app))
      .patch(`/episodes/${episodeId}/annotations/${annotationId}`)
      .send({ text: 'Updated Annotation' })
      .expect(401);
    expect(bodyOf(response).message).toBe('Unauthorized');
  });

  test('should return 404 when the annotation belongs to another user', async () => {
    const annotationBefore = await prisma.annotation.findUnique({
      where: { id: annotationId },
    });

    const response = await request(getAppServer(app))
      .patch(`/episodes/${episodeId}/annotations/${annotationId}`)
      .set('Authorization', `Bearer ${otherAccessToken}`)
      .send({ text: 'Annotation from another user' })
      .expect(404);

    expect(bodyOf(response)).toHaveProperty('statusCode', 404);
    expect(bodyOf(response)).toHaveProperty(
      'message',
      `Annotation or episode not found`,
    );

    const annotationAfter = await prisma.annotation.findUnique({
      where: { id: annotationId },
    });
    expect(annotationAfter?.text).toBe(annotationBefore?.text);
  });
});
