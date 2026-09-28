import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@app';
import { CacheRepository } from '@infrastructure/cache/cache-repository';
import { InMemoryCacheRepository } from '@infrastructure/cache/in-memory/in-memory-cache.repository';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { createTestUser } from '../helpers/create-test-user';
import { authenticateTestUser } from '../helpers/authenticate-test-user';
import { getAppServer } from '../helpers/http-server';
import { bodyOf } from '../helpers/body-of';

describe('Create Stack (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cache: InMemoryCacheRepository;
  let userId: string;
  let accessToken: string;

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
    userId = user.id;

    const authentication = await authenticateTestUser(
      app,
      user.email,
      password,
    );
    accessToken = authentication.accessToken;
  });

  afterEach(async () => {
    await prisma.episode.deleteMany();
    await prisma.stack.deleteMany();
  });

  beforeEach(() => {
    cache.clear();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await app.close();
  });

  test('should create a stack when payload is valid', async () => {
    const response = await request(getAppServer(app))
      .post('/stacks')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Node.js' })
      .expect(201);

    expect(bodyOf(response)).toMatchObject({
      name: 'Node.js',
      userId,
    });
    expect(bodyOf(response).id).toEqual(expect.any(String) as string);

    const stackOnDatabase = await prisma.stack.findUnique({
      where: { id: bodyOf(response).id },
    });

    expect(stackOnDatabase).toMatchObject({
      id: bodyOf(response).id,
      name: 'Node.js',
      userId,
    });
  });

  test('should return 400 when payload is invalid', async () => {
    const response = await request(getAppServer(app))
      .post('/stacks')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: '' })
      .expect(400);

    expect(bodyOf(response).message).toEqual('Validation failed');
  });

  test('should return 400 when payload is missing', async () => {
    const response = await request(getAppServer(app))
      .post('/stacks')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})
      .expect(400);

    expect(bodyOf(response).message).toEqual('Validation failed');
  });

  test('should return 401 when the authorization header is missing', async () => {
    const response = await request(getAppServer(app))
      .post('/stacks')
      .send({ name: 'Node.js' })
      .expect(401);

    expect(bodyOf(response).message).toBe('Unauthorized');

    const stacksOnDatabase = await prisma.stack.findMany();
    expect(stacksOnDatabase).toHaveLength(0);
  });
});
