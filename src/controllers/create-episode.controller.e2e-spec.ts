import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';

describe('Create Episode (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService);

    await app.init();
  });

  test('[POST] /episodes', async () => {
    const response = await request(app.getHttpServer())
      .post('/episodes')
      .send({
        title: 'Test Episode',
        stack: 'Node.js',
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
  });
});
