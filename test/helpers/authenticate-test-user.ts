import request from 'supertest';
import { INestApplication } from '@nestjs/common';

export async function authenticateTestUser(
  app: INestApplication,
  email: string,
  password: string,
) {
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password });

  return { refreshToken: response.body.refreshToken };
}
