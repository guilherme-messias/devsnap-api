import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';
import request from 'supertest';
import { TEST_USER_PASSWORD } from '../helpers/create-test-user';

describe('Create User (E2E)', () => {
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

  afterAll(async () => {
    await prisma.user.deleteMany();
    await app.close();
  });

  test('should create a user when payload is valid', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: TEST_USER_PASSWORD,
        avatarUrl: 'https://example.com/avatar.png',
        role: 'user',
      })
      .expect(201);

    const userOnDatabase = await prisma.user.findUnique({
      where: {
        email: 'test@example.com',
      },
    });

    expect(userOnDatabase).toBeTruthy();
    expect(userOnDatabase?.hashedRefreshToken).toBeNull();
    expect(response.body).toMatchObject({
      id: userOnDatabase?.id,
      name: 'Test User',
      email: 'test@example.com',
      createdAt: expect.any(String),
    });
    expect(response.body).not.toHaveProperty('hashedRefreshToken');
    expect(response.body).not.toHaveProperty('passwordHash');
  });

  test('should return 400 when payload is invalid', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
      })
      .expect(400);

    expect(response.body.message).toEqual('Validation failed');
  });

  test('should return 400 when name is empty', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: '   ',
        email: 'test@example.com',
        password: '123456',
      })
      .expect(400);

    expect(response.body.message).toEqual('Validation failed');
  });

  test('should return 400 when password is weak', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Test User',
        email: 'weak-password@example.com',
        password: '12345678',
      })
      .expect(400);

    expect(response.body.message).toEqual('Validation failed');
  });

  test('should return 400 when user already exists', async () => {
    const payload = {
      name: 'Duplicate User',
      email: 'duplicate@example.com',
      password: TEST_USER_PASSWORD,
    };

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(payload)
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(payload)
      .expect(400);

    expect(response.body).toEqual({
      statusCode: 400,
      message: 'User already exists',
      error: 'Bad Request',
    });
  });
});
