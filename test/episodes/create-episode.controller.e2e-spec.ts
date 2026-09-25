import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { AppModule } from '@app';
import { CacheRepository } from '@infrastructure/cache/cache-repository';
import { InMemoryCacheRepository } from '@infrastructure/cache/in-memory/in-memory-cache.repository';
import { createTestUser } from '../helpers/create-test-user';
import { authenticateTestUser } from '../helpers/authenticate-test-user';

describe('Create Episode (E2E)', () => {
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

    await prisma.stack.create({
      data: { name: 'Rust', userId: otherUser.id },
    });

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

  test('should create an episode when payload is valid', async () => {
    const response = await request(app.getHttpServer())
      .post('/episodes')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Test Episode',
        stackId,
        error: 'Some error',
        solution: 'Some solution',
      })
      .expect(201);

    const userOnDatabase = await prisma.episode.findUnique({
      where: {
        id: response.body.id,
      },
    });

    expect(userOnDatabase).toBeTruthy();
    expect(response.body).toMatchObject({
      stackId,
      stack: { id: stackId, name: 'Node.js' },
      annotations: [],
    });
  });

  test('should return 400 when payload is invalid', async () => {
    const response = await request(app.getHttpServer())
      .post('/episodes')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Test Episode',
        stackId,
        error: 'Some error',
      })
      .expect(400);

    expect(response.body.message).toEqual('Validation failed');
  });

  test('should return 400 when title is empty', async () => {
    const response = await request(app.getHttpServer())
      .post('/episodes')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: '   ',
        stackId,
        error: 'Some error',
        solution: 'Some solution',
      })
      .expect(400);

    expect(response.body.message).toEqual('Validation failed');
  });

  test('should return 401 when the authorization header is missing', async () => {
    const response = await request(app.getHttpServer())
      .post('/episodes')
      .send({
        title: 'Test Episode',
        stackId,
        error: 'Some error',
        solution: 'Some solution',
      })
      .expect(401);

    expect(response.body.message).toBe('Unauthorized');
  });

  test('should return 404 when the stack belongs to another user', async () => {
    const response = await request(app.getHttpServer())
      .post('/episodes')
      .set('Authorization', `Bearer ${otherUserAccessToken}`)
      .send({
        title: 'Test Episode',
        stackId,
        error: 'Some error',
        solution: 'Some solution',
      })
      .expect(404);

    expect(response.body).toHaveProperty('statusCode', 404);
    expect(response.body).toHaveProperty('message', 'Stack not found');
  });

  test('should return 404 when the stack does not exist', async () => {
    const nonExistingStackId = '00000000-0000-0000-0000-000000000000';

    const response = await request(app.getHttpServer())
      .post('/episodes')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Test Episode',
        stackId: nonExistingStackId,
        error: 'Some error',
        solution: 'Some solution',
      })
      .expect(404);

    expect(response.body).toHaveProperty('message', 'Stack not found');
  });
});
