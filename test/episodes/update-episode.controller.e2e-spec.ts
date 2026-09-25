import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { AppModule } from '@app';
import { CacheRepository } from '@infrastructure/cache/cache-repository';
import { InMemoryCacheRepository } from '@infrastructure/cache/in-memory/in-memory-cache.repository';
import { createTestUser } from '../helpers/create-test-user';
import { authenticateTestUser } from '../helpers/authenticate-test-user';

describe('Update Episode (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cache: InMemoryCacheRepository;
  let sourceStackId: string;
  let targetStackId: string;
  let accessToken: string;
  let otherUserAccessToken: string;
  let otherUserStackId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CacheRepository)
      .useClass(InMemoryCacheRepository)
      .compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService);
    cache = moduleRef.get(CacheRepository) as InMemoryCacheRepository;

    await app.init();

    const { user, password } = await createTestUser(prisma);

    const [sourceStack, targetStack] = await Promise.all([
      prisma.stack.create({ data: { name: 'Node.js', userId: user.id } }),
      prisma.stack.create({ data: { name: 'TypeScript', userId: user.id } }),
    ]);
    sourceStackId = sourceStack.id;
    targetStackId = targetStack.id;

    const authentication = await authenticateTestUser(
      app,
      user.email,
      password,
    );
    accessToken = authentication.accessToken;

    const { user: otherUser, password: otherUserPassword } =
      await createTestUser(prisma);

    const otherStack = await prisma.stack.create({
      data: { name: 'Rust', userId: otherUser.id },
    });
    otherUserStackId = otherStack.id;

    const otherAuthentication = await authenticateTestUser(
      app,
      otherUser.email,
      otherUserPassword,
    );
    otherUserAccessToken = otherAuthentication.accessToken;
  });

  beforeEach(() => {
    cache.clear();
  });

  afterAll(async () => {
    await prisma.episode.deleteMany({});
    await prisma.stack.deleteMany({});
    await prisma.user.deleteMany();
    await app.close();
  });

  test('should update an episode when payload is valid', async () => {
    const episode = await prisma.episode.create({
      data: {
        title: 'Test Episode',
        stackId: sourceStackId,
        error: 'Some error',
        solution: 'Some solution',
        annotations: { create: [{ text: 'Existing note' }] },
      },
    });

    const response = await request(app.getHttpServer())
      .put(`/episodes/${episode.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Updated Episode',
        stackId: targetStackId,
        error: 'Updated error',
        solution: 'Updated solution',
      })
      .expect(200);

    expect(response.body).toHaveProperty('episode');
    expect(response.body.episode.title).toEqual('Updated Episode');
    expect(response.body.episode.error).toEqual('Updated error');
    expect(response.body.episode.solution).toEqual('Updated solution');
    expect(response.body.episode.annotations).toEqual([
      expect.objectContaining({
        text: 'Existing note',
        episodeId: episode.id,
      }),
    ]);
    expect(response.body.episode.stackId).toEqual(targetStackId);
    expect(response.body.episode.stack).toMatchObject({
      id: targetStackId,
      name: 'TypeScript',
    });

    const episodeOnDatabase = await prisma.episode.findUnique({
      where: { id: episode.id },
    });
    expect(episodeOnDatabase?.stackId).toEqual(targetStackId);

    const annotationsOnDatabase = await prisma.annotation.findMany({
      where: { episodeId: episode.id },
    });
    expect(annotationsOnDatabase).toHaveLength(1);
    expect(annotationsOnDatabase[0].text).toEqual('Existing note');
  });

  test('should return 400 when payload is invalid', async () => {
    const episode = await prisma.episode.create({
      data: {
        title: 'Test Episode',
        stackId: sourceStackId,
        error: 'Some error',
        solution: 'Some solution',
      },
    });

    const response = await request(app.getHttpServer())
      .put(`/episodes/${episode.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
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
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Updated Episode',
        stackId: targetStackId,
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

  test('should return 400 when title is empty', async () => {
    const episode = await prisma.episode.create({
      data: {
        title: 'Test Episode',
        stackId: sourceStackId,
        error: 'Some error',
        solution: 'Some solution',
      },
    });

    await request(app.getHttpServer())
      .put(`/episodes/${episode.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: '   ',
      })
      .expect(400);
  });

  test('should return 401 when the authorization header is missing', async () => {
    const episode = await prisma.episode.create({
      data: {
        title: 'Test Episode',
        stackId: sourceStackId,
        error: 'Some error',
        solution: 'Some solution',
      },
    });

    const response = await request(app.getHttpServer())
      .put(`/episodes/${episode.id}`)
      .send({
        title: 'Updated Episode',
        stackId: targetStackId,
        error: 'Updated error',
        solution: 'Updated solution',
      })
      .expect(401);

    expect(response.body.message).toBe('Unauthorized');

    const episodeOnDatabase = await prisma.episode.findUnique({
      where: { id: episode.id },
    });
    expect(episodeOnDatabase?.title).toEqual('Test Episode');
  });

  test('should return 404 when the episode belongs to another user', async () => {
    const episode = await prisma.episode.create({
      data: {
        title: 'Owner Episode',
        stackId: sourceStackId,
        error: 'Some error',
        solution: 'Some solution',
      },
    });

    const response = await request(app.getHttpServer())
      .put(`/episodes/${episode.id}`)
      .set('Authorization', `Bearer ${otherUserAccessToken}`)
      .send({
        title: 'Hacked Episode',
        stackId: otherUserStackId,
        error: 'Updated error',
        solution: 'Updated solution',
      })
      .expect(404);

    expect(response.body).toHaveProperty('statusCode', 404);
    expect(response.body).toHaveProperty(
      'message',
      `Episode with ID ${episode.id} not found`,
    );

    const episodeOnDatabase = await prisma.episode.findUnique({
      where: { id: episode.id },
    });
    expect(episodeOnDatabase?.title).toEqual('Owner Episode');
    expect(episodeOnDatabase?.stackId).toEqual(sourceStackId);
  });

  test('should return 404 when the target stack belongs to another user', async () => {
    const episode = await prisma.episode.create({
      data: {
        title: 'Owner Episode',
        stackId: sourceStackId,
        error: 'Some error',
        solution: 'Some solution',
      },
    });

    const response = await request(app.getHttpServer())
      .put(`/episodes/${episode.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Updated Episode',
        stackId: otherUserStackId,
        error: 'Updated error',
        solution: 'Updated solution',
      })
      .expect(404);

    expect(response.body).toHaveProperty('statusCode', 404);
    expect(response.body).toHaveProperty('message', 'Stack not found');

    const episodeOnDatabase = await prisma.episode.findUnique({
      where: { id: episode.id },
    });
    expect(episodeOnDatabase?.stackId).toEqual(sourceStackId);
  });
});
