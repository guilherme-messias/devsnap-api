import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types';

export const getAppServer = (app: INestApplication): App =>
  app.getHttpServer() as App;
