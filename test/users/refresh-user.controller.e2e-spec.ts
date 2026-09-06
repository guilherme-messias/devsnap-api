import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '@src/app.module';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';
import { createTestUser } from '../helpers/create-test-user';
import request from 'supertest';
import { authenticateTestUser } from '../helpers/authenticate-test-user';

describe('Refresh User (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwt: JwtService;
  let configService: ConfigService;
  let credentials: { email: string; password: string };
  let userId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService);
    jwt = moduleRef.get(JwtService);
    configService = moduleRef.get(ConfigService);

    await app.init();

    const { user, password } = await createTestUser(prisma);
    credentials = { email: user.email, password };
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await app.close();
  });

  test('should refresh tokens when refresh token is valid', async () => {
    const { refreshToken } = await authenticateTestUser(
      app,
      credentials.email,
      credentials.password,
    );
    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Authorization', `Bearer ${refreshToken}`)
      .expect(201);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  });

  test('should return 401 when refresh token is invalid', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Authorization', `Bearer invalid-token`)
      .expect(401);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Unauthorized');
  });

  test('should return 401 when refresh token is expired', async () => {
    const expiredRefreshToken = await jwt.signAsync(
      { sub: userId, email: credentials.email },
      {
        privateKey: Buffer.from(
          configService.getOrThrow<string>('JWT_PRIVATE_KEY'),
          'base64',
        ).toString('utf-8'),
        algorithm: 'RS256',
        expiresIn: -1,
      },
    );

    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Authorization', `Bearer ${expiredRefreshToken}`)
      .expect(401);

    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Unauthorized',
    });
  });

  test('should return 401 when refresh token hash is null', async () => {
    const { refreshToken } = await authenticateTestUser(
      app,
      credentials.email,
      credentials.password,
    );

    await prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken: null },
    });

    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Authorization', `Bearer ${refreshToken}`)
      .expect(401);

    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Refresh token invalid',
      error: 'Unauthorized',
    });
  });

  test('should return 401 when authorization header is missing', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .expect(401);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Unauthorized');
  });
});
