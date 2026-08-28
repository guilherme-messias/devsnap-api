import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@src/app.module';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';
import { createTestUser } from '../helpers/create-test-user';

describe('Fetch Recent Episodes (E2E)', () => {
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

    const user = await createTestUser(prisma);
    const stack = await prisma.stack.create({
      data: { name: 'Node.js', userId: user.id },
    });
    stackId = stack.id;

    await prisma.episode.create({
      data: {
        title: 'Test Episode',
        stackId,
        error: 'Some error',
        solution: 'Some solution',
      },
    });

    await prisma.episode.create({
      data: {
        title: 'Another Test Episode',
        stackId,
        error: 'Some other error',
        solution: 'Some other solution',
      },
    });
  });

  afterAll(async () => {
    await prisma.episode.deleteMany({});
    await prisma.stack.deleteMany({});
    await prisma.user.deleteMany();
    await app.close();
  });

  test('should return the most recent episode', async () => {
    const response = await request(app.getHttpServer())
      .get('/episodes?page=1')
      .expect(200);

    expect(response.body.episodes).toBeInstanceOf(Array);
    expect(response.body.episodes.length).toBe(1);
    expect(response.body.episodes[0].title).toBe('Another Test Episode');
  });

  test('should paginate correctly when page=2', async () => {
    const response = await request(app.getHttpServer())
      .get('/episodes?page=2')
      .expect(200);

    expect(response.body.episodes).toBeInstanceOf(Array);
    expect(response.body.episodes.length).toBe(1);
    expect(response.body.episodes[0].title).toBe('Test Episode');
  });

  test('should default to page 1 when page is not provided', async () => {
    const response = await request(app.getHttpServer())
      .get('/episodes')
      .expect(200);

    expect(response.body.episodes).toBeInstanceOf(Array);
    expect(response.body.episodes.length).toBe(1);
    expect(response.body.episodes[0].title).toBe('Another Test Episode');
  });

  test('should return episodes in expected response shape', async () => {
    const response = await request(app.getHttpServer())
      .get('/episodes?page=1')
      .expect(200);

    expect(response.body).toHaveProperty('episodes');
    expect(response.body.episodes[0]).toHaveProperty('id');
    expect(response.body.episodes[0]).toHaveProperty('title');
    expect(response.body.episodes[0]).toHaveProperty('stack');
    expect(response.body.episodes[0]).toHaveProperty('stackId', stackId);
    expect(response.body.episodes[0].stack).toMatchObject({
      id: stackId,
      name: 'Node.js',
    });
    expect(response.body.episodes[0]).toHaveProperty('error');
    expect(response.body.episodes[0]).toHaveProperty('solution');
  });

  test('should return 200 and an empty array when there are no episodes', async () => {
    await prisma.episode.deleteMany({});

    const response = await request(app.getHttpServer())
      .get('/episodes?page=1')
      .expect(200);

    expect(response.body.episodes).toBeInstanceOf(Array);
    expect(response.body.episodes.length).toBe(0);
  });

  test('should return 400 when page is less than 1', async () => {
    const response = await request(app.getHttpServer())
      .get('/episodes?page=0')
      .expect(400);

    expect(response.body.message).toEqual('Validation failed');
  });

  test('should return 400 when page is not an integer', async () => {
    const response = await request(app.getHttpServer())
      .get('/episodes?page=abc')
      .expect(400);

    expect(response.body.message).toEqual('Validation failed');
  });

  test('should return 400 when page is not a number', async () => {
    const response = await request(app.getHttpServer())
      .get('/episodes?page=abc')
      .expect(400);

    expect(response.body.message).toEqual('Validation failed');
  });

  test('should return an empty array when page exceeds available episodes', async () => {
    const response = await request(app.getHttpServer())
      .get('/episodes?page=99')
      .expect(200);

    expect(response.body.episodes).toBeInstanceOf(Array);
    expect(response.body.episodes.length).toBe(0);
  });
});
