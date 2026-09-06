import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '@src/app.module';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';
import { createTestUser } from '../helpers/create-test-user';
import { authenticateTestUser } from '../helpers/authenticate-test-user';

describe('Get User Profile Controller (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwt: JwtService;
  let configService: ConfigService;
  let credentials: { email: string; password: string };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService);
    jwt = moduleRef.get(JwtService);
    configService = moduleRef.get(ConfigService);

    await app.init();

    const { user, password } = await createTestUser(prisma, '12345678');
    credentials = { email: user.email, password };
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await app.close();
  });

  test('should return the user profile', async () => {
    const { refreshToken } = await authenticateTestUser(
      app,
      credentials.email,
      credentials.password,
    );

    const response = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${refreshToken}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('email');
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('avatarUrl');
    expect(response.body).toHaveProperty('role');
  });

  test('should return 404 when the user is not found', async () => {
    const refreshToken = await jwt.signAsync(
      { sub: randomUUID(), email: 'missing@test.com' },
      {
        privateKey: Buffer.from(
          configService.getOrThrow<string>('JWT_PRIVATE_KEY'),
          'base64',
        ).toString('utf-8'),
        algorithm: 'RS256',
        expiresIn: '7d',
      },
    );

    const response = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${refreshToken}`)
      .expect(404);

    expect(response.body).toEqual({
      statusCode: 404,
      message: 'User not found',
      error: 'Not Found',
    });
  });

  test('should return 401 when the authorization header is missing', async () => {
    const response = await request(app.getHttpServer())
      .get('/users/me')
      .expect(401);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Unauthorized');
  });

  test('should return 401 when the authorization header is invalid', async () => {
    const response = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Unauthorized');
  });
});
