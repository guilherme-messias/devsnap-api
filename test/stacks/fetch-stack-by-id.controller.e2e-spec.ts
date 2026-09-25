import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@app';
import { CacheRepository } from '@infrastructure/cache/cache-repository';
import { InMemoryCacheRepository } from '@infrastructure/cache/in-memory/in-memory-cache.repository';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { createTestUser } from '../helpers/create-test-user';
import { authenticateTestUser } from '../helpers/authenticate-test-user';

describe('Fetch Stack By Id (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cache: InMemoryCacheRepository;
  let stackId: string;
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
    const stack = await prisma.stack.create({
      data: { name: 'Node.js', userId: user.id },
    });
    stackId = stack.id;

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
  });

  beforeEach(() => {
    cache.clear();
  });

  afterAll(async () => {
    await prisma.stack.deleteMany({});
    await prisma.user.deleteMany();
    await app.close();
  });

  test('should return the stack by id', async () => {
    const response = await request(app.getHttpServer())
      .get(`/stacks/${stackId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('stack');
    expect(response.body.stack).toHaveProperty('id', stackId);
    expect(response.body.stack).toHaveProperty('name', 'Node.js');
  });

  test('should return 404 for non-existing stack id', async () => {
    const nonExistingId = '00000000-0000-0000-0000-000000000000';

    const response = await request(app.getHttpServer())
      .get(`/stacks/${nonExistingId}`)
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
      .get(`/stacks/${invalidId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);

    expect(response.body).toHaveProperty('statusCode', 400);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Validation failed');
  });

  test('should return 401 when the authorization header is missing', async () => {
    const response = await request(app.getHttpServer())
      .get(`/stacks/${stackId}`)
      .expect(401);

    expect(response.body.message).toBe('Unauthorized');
  });

  test('should return 404 when the stack belongs to another user', async () => {
    const response = await request(app.getHttpServer())
      .get(`/stacks/${stackId}`)
      .set('Authorization', `Bearer ${otherUserAccessToken}`)
      .expect(404);

    expect(response.body).toHaveProperty('statusCode', 404);
    expect(response.body).toHaveProperty(
      'message',
      `Stack with ID ${stackId} not found`,
    );
  });
});
