import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { getAppServer } from './http-server';

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export async function authenticateTestUser(
  app: INestApplication,
  email: string,
  password: string,
): Promise<AuthTokens> {
  const response = await request(getAppServer(app))
    .post('/auth/login')
    .send({ email, password });

  const body = response.body as AuthTokens;

  return {
    accessToken: body.accessToken,
    refreshToken: body.refreshToken,
  };
}
