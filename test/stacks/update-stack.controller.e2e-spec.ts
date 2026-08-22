import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('Update Stack (E2E)', () => {
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
  });

  afterAll(async () => {
    await prisma.stack.deleteMany({});
    await app.close();
  });

  test('should update a stack when payload is valid', async () => {
    const stack = await prisma.stack.create({ data: { name: 'Node.js' } });
    stackId = stack.id;

    const response = await request(app.getHttpServer())
      .patch(`/stacks/${stackId}`)
      .send({
        name: 'Updated Stack Name',
      })
      .expect(200);

    expect(response.body).toHaveProperty('stack');
    expect(response.body.stack.name).toEqual('Updated Stack Name');
  });

  test('should return 400 when payload is invalid', async () => {
    const stack = await prisma.stack.create({ data: { name: 'Node.js' } });
    stackId = stack.id;

    const response = await request(app.getHttpServer())
      .patch(`/stacks/${stackId}`)
      .send({
        name: '',
      })
      .expect(400);

    expect(response.body).toHaveProperty('statusCode', 400);
    expect(response.body.message).toEqual('Validation failed');
  });

  test('should return 404 when stack does not exist', async () => {
    const stack = await prisma.stack.create({ data: { name: 'Node.js' } });
    stackId = stack.id;

    const nonExistentStackId = '00000000-0000-0000-0000-000000000000';

    const response = await request(app.getHttpServer())
      .patch(`/stacks/${nonExistentStackId}`)
      .send({
        name: 'Updated Stack Name',
      })
      .expect(404);

    expect(response.body).toHaveProperty('statusCode', 404);
    expect(response.body).toHaveProperty(
      'message',
      `Stack with ID ${nonExistentStackId} not found`,
    );
  });

  test('should return 400 when name is empty', async () => {
    const stack = await prisma.stack.create({ data: { name: 'Node.js' } });
    stackId = stack.id;

    const response = await request(app.getHttpServer())
      .patch(`/stacks/${stackId}`)
      .send({
        name: '',
      })
      .expect(400);

    expect(response.body).toHaveProperty('statusCode', 400);
    expect(response.body).toHaveProperty('message', 'Validation failed');
  });
});
