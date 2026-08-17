import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../prisma/prisma.service';

describe('Fetch Recent Episodes (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService);

    await app.init();

    await prisma.episode.create({
      data: {
        title: 'Test Episode',
        stack: 'Node.js',
        error: 'Some error',
        solution: 'Some solution',
      },
    });

    await prisma.episode.create({
      data: {
        title: 'Another Test Episode',
        stack: 'Node.js',
        error: 'Some other error',
        solution: 'Some other solution',
      },
    });
  });

  afterAll(async () => {
    await prisma.episode.deleteMany({});
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

  test('should return episodes in expected response shape', async () => {
    const response = await request(app.getHttpServer())
      .get('/episodes?page=1')
      .expect(200);

    expect(response.body).toHaveProperty('episodes');
    expect(response.body.episodes[0]).toHaveProperty('id');
    expect(response.body.episodes[0]).toHaveProperty('title');
    expect(response.body.episodes[0]).toHaveProperty('stack');
    expect(response.body.episodes[0]).toHaveProperty('error');
    expect(response.body.episodes[0]).toHaveProperty('solution');
  });
});
