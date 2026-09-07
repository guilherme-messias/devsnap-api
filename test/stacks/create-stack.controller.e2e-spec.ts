import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@app';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { createTestUser } from '../helpers/create-test-user';
import { authenticateTestUser } from '../helpers/authenticate-test-user';

describe('Create Stack (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userId: string;
  let accessToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);

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

  afterAll(async () => {
    await prisma.user.deleteMany();
    await app.close();
  });

  test('should create a stack when payload is valid', async () => {
    const response = await request(app.getHttpServer())
      .post('/stacks')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Node.js' })
      .expect(201);

    expect(response.body).toMatchObject({
      name: 'Node.js',
      userId,
    });
    expect(response.body.id).toEqual(expect.any(String));

    const stackOnDatabase = await prisma.stack.findUnique({
      where: { id: response.body.id },
    });

    expect(stackOnDatabase).toMatchObject({
      id: response.body.id,
      name: 'Node.js',
      userId,
    });
  });

  test('should return 400 when payload is invalid', async () => {
    const response = await request(app.getHttpServer())
      .post('/stacks')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: '' })
      .expect(400);

    expect(response.body.message).toEqual('Validation failed');
  });

  test('should return 400 when payload is missing', async () => {
    const response = await request(app.getHttpServer())
      .post('/stacks')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})
      .expect(400);

    expect(response.body.message).toEqual('Validation failed');
  });

  test('should return 401 when the authorization header is missing', async () => {
    const response = await request(app.getHttpServer())
      .post('/stacks')
      .send({ name: 'Node.js' })
      .expect(401);

    expect(response.body.message).toBe('Unauthorized');

    const stacksOnDatabase = await prisma.stack.findMany();
    expect(stacksOnDatabase).toHaveLength(0);
  });
});
