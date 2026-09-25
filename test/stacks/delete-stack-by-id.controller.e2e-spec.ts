import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@app';
import { CacheRepository } from '@infrastructure/cache/cache-repository';
import { InMemoryCacheRepository } from '@infrastructure/cache/in-memory/in-memory-cache.repository';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { createTestUser } from '../helpers/create-test-user';
import { authenticateTestUser } from '../helpers/authenticate-test-user';

describe('Delete Stack By Id (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cache: InMemoryCacheRepository;
  let stackId: string;
  let userId: string;
  let accessToken: string;
  let otherUserAccessToken: string;

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
    userId = user.id;

    const authentication = await authenticateTestUser(
      app,
      user.email,
      password,
    );
    accessToken = authentication.accessToken;

    const { user: otherUser, password: otherUserPassword } =
      await createTestUser(prisma);

    const otherAuthentication = await authenticateTestUser(
      app,
      otherUser.email,
      otherUserPassword,
    );
    otherUserAccessToken = otherAuthentication.accessToken;

    const stack = await prisma.stack.create({
      data: { name: 'Node.js', userId },
    });
    stackId = stack.id;
  });

  beforeEach(() => {
    cache.clear();
  });

  afterAll(async () => {
    await prisma.stack.deleteMany({});
    await prisma.user.deleteMany();
    await app.close();
  });

  test('should delete the stack by id', async () => {
    await request(app.getHttpServer())
      .delete(`/stacks/${stackId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);

    const deletedStack = await prisma.stack.findUnique({
      where: { id: stackId },
    });
    expect(deletedStack).toBeNull();
  });

  test('should delete the stack and its associated episodes', async () => {
    const stack = await prisma.stack.create({
      data: { name: 'React', userId },
    });
    const episode = await prisma.episode.create({
      data: {
        title: 'React Episode',
        error: 'React Error',
        solution: 'React Solution',
        stackId: stack.id,
      },
    });

    await request(app.getHttpServer())
      .delete(`/stacks/${stack.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);

    const deletedStack = await prisma.stack.findUnique({
      where: { id: stack.id },
    });
    expect(deletedStack).toBeNull();

    const deletedEpisode = await prisma.episode.findUnique({
      where: { id: episode.id },
    });
    expect(deletedEpisode).toBeNull();
  });

  test('should return 404 for non-existing stack id', async () => {
    const nonExistingId = '00000000-0000-0000-0000-000000000000';

    const response = await request(app.getHttpServer())
      .delete(`/stacks/${nonExistingId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);

    expect(response.body).toHaveProperty('statusCode', 404);
    expect(response.body).toHaveProperty(
      'message',
      `Stack with ID ${nonExistingId} not found`,
    );
  });

  test('should return 400 for invalid stack id', async () => {
    const invalidId = 'invalid-uuid';

    const response = await request(app.getHttpServer())
      .delete(`/stacks/${invalidId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);

    expect(response.body).toHaveProperty('statusCode', 400);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Validation failed');
  });

  test('should return 401 when the authorization header is missing', async () => {
    const stack = await prisma.stack.create({
      data: { name: 'Vue.js', userId },
    });

    const response = await request(app.getHttpServer())
      .delete(`/stacks/${stack.id}`)
      .expect(401);

    expect(response.body.message).toBe('Unauthorized');

    const stackOnDatabase = await prisma.stack.findUnique({
      where: { id: stack.id },
    });
    expect(stackOnDatabase).not.toBeNull();
  });

  test('should return 404 when the stack belongs to another user', async () => {
    const stack = await prisma.stack.create({
      data: { name: 'Svelte', userId },
    });

    const response = await request(app.getHttpServer())
      .delete(`/stacks/${stack.id}`)
      .set('Authorization', `Bearer ${otherUserAccessToken}`)
      .expect(404);

    expect(response.body).toHaveProperty('statusCode', 404);
    expect(response.body).toHaveProperty(
      'message',
      `Stack with ID ${stack.id} not found`,
    );

    const stackOnDatabase = await prisma.stack.findUnique({
      where: { id: stack.id },
    });
    expect(stackOnDatabase).not.toBeNull();
  });
});
