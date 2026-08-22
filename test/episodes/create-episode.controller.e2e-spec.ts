import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../../src/prisma/prisma.service';
import { AppModule } from '../../src/app.module';

describe('Create Episode (E2E)', () => {
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

    const stack = await prisma.stack.create({ data: { name: 'Node.js' } });
    stackId = stack.id;
  });

  afterAll(async () => {
    await prisma.episode.deleteMany({});
    await prisma.stack.deleteMany({});
    await app.close();
  });

  test('should create an episode when payload is valid', async () => {
    const response = await request(app.getHttpServer())
      .post('/episodes')
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
    });
  });

  test('should return 400 when payload is invalid', async () => {
    const response = await request(app.getHttpServer())
      .post('/episodes')
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
      .send({
        title: '   ',
        stackId,
        error: 'Some error',
        solution: 'Some solution',
      })
      .expect(400);

    expect(response.body.message).toEqual('Validation failed');
  });
});
