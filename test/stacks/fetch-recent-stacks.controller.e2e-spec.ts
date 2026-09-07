import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@app';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { createTestUser } from '../helpers/create-test-user';
import { authenticateTestUser } from '../helpers/authenticate-test-user';

describe('Fetch Recent Stacks (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let otherUserAccessToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService);

    await app.init();

    const { user, password } = await createTestUser(prisma);

    await prisma.stack.create({ data: { name: 'Node.js', userId: user.id } });
    await prisma.stack.create({ data: { name: 'Python', userId: user.id } });

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

  afterAll(async () => {
    await prisma.stack.deleteMany({});
    await prisma.user.deleteMany();
    await app.close();
  });

  test('should fetch recent stacks', async () => {
    const response = await request(app.getHttpServer())
      .get(`/stacks?page=1`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(response.body.stacks).toBeInstanceOf(Array);
    expect(response.body.stacks.length).toBe(1);
    expect(response.body.stacks[0].name).toBe('Python');
  });

  test('should paginate correctly when page=2', async () => {
    const response = await request(app.getHttpServer())
      .get(`/stacks?page=2`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(response.body.stacks).toBeInstanceOf(Array);
    expect(response.body.stacks.length).toBe(1);
    expect(response.body.stacks[0].name).toBe('Node.js');
  });

  test('should default to page=1 when no page query param is provided', async () => {
    const response = await request(app.getHttpServer())
      .get(`/stacks`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(response.body.stacks).toBeInstanceOf(Array);
    expect(response.body.stacks.length).toBe(1);
    expect(response.body.stacks[0].name).toBe('Python');
  });

  test('should not return stacks that belong to another user', async () => {
    const firstPage = await request(app.getHttpServer())
      .get(`/stacks?page=1`)
      .set('Authorization', `Bearer ${otherUserAccessToken}`)
      .expect(200);

    expect(firstPage.body.stacks).toBeInstanceOf(Array);
    expect(firstPage.body.stacks.length).toBe(1);
    expect(firstPage.body.stacks[0].name).toBe('Rust');

    const secondPage = await request(app.getHttpServer())
      .get(`/stacks?page=2`)
      .set('Authorization', `Bearer ${otherUserAccessToken}`)
      .expect(200);

    expect(secondPage.body.stacks).toBeInstanceOf(Array);
    expect(secondPage.body.stacks.length).toBe(0);
  });

  test('should return 401 when the authorization header is missing', async () => {
    const response = await request(app.getHttpServer())
      .get(`/stacks?page=1`)
      .expect(401);

    expect(response.body.message).toBe('Unauthorized');
  });

  test('should return empty array when no stacks are found', async () => {
    await prisma.stack.deleteMany({});

    const response = await request(app.getHttpServer())
      .get(`/stacks?page=1`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.stacks).toBeInstanceOf(Array);
    expect(response.body.stacks.length).toBe(0);
  });

  test('should return 400 when page is less than 1', async () => {
    const response = await request(app.getHttpServer())
      .get(`/stacks?page=0`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);

    expect(response.body.message).toEqual('Validation failed');
  });

  test('should return 400 when page is not an integer', async () => {
    const response = await request(app.getHttpServer())
      .get('/stacks?page=abc')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);

    expect(response.body.message).toEqual('Validation failed');
  });

  test('should return 400 when page is not a number', async () => {
    const response = await request(app.getHttpServer())
      .get('/stacks?page=abc')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);

    expect(response.body.message).toEqual('Validation failed');
  });

  test('should return an empty array when page exceeds available stacks', async () => {
    const response = await request(app.getHttpServer())
      .get('/stacks?page=99')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.stacks).toBeInstanceOf(Array);
    expect(response.body.stacks.length).toBe(0);
  });
});
