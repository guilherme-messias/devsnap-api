import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@src/app.module';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';
import { createTestUser } from '../helpers/create-test-user';

describe('Fetch Recent Stacks (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let stackId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService);

    await app.init();

    const { user } = await createTestUser(prisma, '12345678');

    await prisma.stack.create({ data: { name: 'Node.js', userId: user.id } });
    await prisma.stack.create({ data: { name: 'Python', userId: user.id } });
  });

  afterAll(async () => {
    await prisma.stack.deleteMany({});
    await prisma.user.deleteMany();
    await app.close();
  });

  test('should fetch recent stacks', async () => {
    const response = await request(app.getHttpServer())
      .get(`/stacks?page=1`)
      .expect(200);
    expect(response.body.stacks).toBeInstanceOf(Array);
    expect(response.body.stacks.length).toBe(1);
    expect(response.body.stacks[0].name).toBe('Python');
  });

  test('should paginate correctly when page=2', async () => {
    const response = await request(app.getHttpServer())
      .get(`/stacks?page=2`)
      .expect(200);
    expect(response.body.stacks).toBeInstanceOf(Array);
    expect(response.body.stacks.length).toBe(1);
    expect(response.body.stacks[0].name).toBe('Node.js');
  });

  test('should default to page=1 when no page query param is provided', async () => {
    const response = await request(app.getHttpServer())
      .get(`/stacks`)
      .expect(200);
    expect(response.body.stacks).toBeInstanceOf(Array);
    expect(response.body.stacks.length).toBe(1);
    expect(response.body.stacks[0].name).toBe('Python');
  });

  test('should return empty array when no stacks are found', async () => {
    await prisma.stack.deleteMany({});

    const response = await request(app.getHttpServer())
      .get(`/stacks?page=1`)
      .expect(200);

    expect(response.body.stacks).toBeInstanceOf(Array);
    expect(response.body.stacks.length).toBe(0);
  });

  test('should return 400 when page is less than 1', async () => {
    const response = await request(app.getHttpServer())
      .get(`/stacks?page=0`)
      .expect(400);

    expect(response.body.message).toEqual('Validation failed');
  });

  test('should return 400 when page is not an integer', async () => {
    const response = await request(app.getHttpServer())
      .get('/stacks?page=abc')
      .expect(400);

    expect(response.body.message).toEqual('Validation failed');
  });

  test('should return 400 when page is not a number', async () => {
    const response = await request(app.getHttpServer())
      .get('/stacks?page=abc')
      .expect(400);

    expect(response.body.message).toEqual('Validation failed');
  });

  test('should return an empty array when page exceeds available stacks', async () => {
    const response = await request(app.getHttpServer())
      .get('/stacks?page=99')
      .expect(200);

    expect(response.body.stacks).toBeInstanceOf(Array);
    expect(response.body.stacks.length).toBe(0);
  });
});
