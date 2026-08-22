import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('Delete Stack By Id (E2E)', () => {
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

  test('should delete the stack by id', async () => {
    await request(app.getHttpServer()).delete(`/stacks/${stackId}`).expect(204);

    const deletedStack = await prisma.stack.findUnique({
      where: { id: stackId },
    });
    expect(deletedStack).toBeNull();
  });

  test('should delete the stack and its associated episodes', async () => {
    const stack = await prisma.stack.create({ data: { name: 'React' } });
    const episode = await prisma.episode.create({
      data: {
        title: 'React Episode',
        error: 'React Error',
        solution: 'React Solution',
        stackId: stack.id,
      },
    });

    await request(app.getHttpServer())
      .delete(`/stacks/${stack.id}`)
      .expect(204);

    const deletedStack = await prisma.stack.findUnique({
      where: { id: stack.id },
    });
    expect(deletedStack).toBeNull();

    const deletedEpisode = await prisma.episode.findUnique({
      where: { id: episode.id },
    });
    expect(deletedEpisode).toBeNull();
  });

  test('should return 404 for non-existing stack id', async () => {
    const nonExistingId = '00000000-0000-0000-0000-000000000000';

    const response = await request(app.getHttpServer())
      .delete(`/stacks/${nonExistingId}`)
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
      .delete(`/stacks/${invalidId}`)
      .expect(400);

    expect(response.body).toHaveProperty('statusCode', 400);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Validation failed');
  });
});
