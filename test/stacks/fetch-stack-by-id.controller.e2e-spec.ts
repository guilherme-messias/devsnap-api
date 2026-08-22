import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('Fetch Stack By Id (E2E)', () => {
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
    await prisma.stack.deleteMany({});
    await app.close();
  });

  test('should return the stack by id', async () => {
    const response = await request(app.getHttpServer())
      .get(`/stacks/${stackId}`)
      .expect(200);

    expect(response.body).toHaveProperty('stack');
    expect(response.body.stack).toHaveProperty('id', stackId);
    expect(response.body.stack).toHaveProperty('name', 'Node.js');
  });

  test('should return 404 for non-existing stack id', async () => {
    const nonExistingId = '00000000-0000-0000-0000-000000000000';

    const response = await request(app.getHttpServer())
      .get(`/stacks/${nonExistingId}`)
      .expect(404);

    expect(response.body).toHaveProperty('statusCode', 404);
    expect(response.body).toHaveProperty(
      'message',
      `Stack with ID ${nonExistingId} not found`,
    );
  });

  test('should return 400 for invalid stack id', async () => {
    const invalidId = 'invalid-uuid';

    const response = await request(app.getHttpServer())
      .get(`/stacks/${invalidId}`)
      .expect(400);

    expect(response.body).toHaveProperty('statusCode', 400);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Validation failed');
  });
});
