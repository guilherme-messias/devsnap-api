import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { Test } from '@nestjs/testing';
import request from 'supertest';

describe('Update Episode (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let sourceStackId: string;
  let targetStackId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService);

    await app.init();

    const [sourceStack, targetStack] = await Promise.all([
      prisma.stack.create({ data: { name: 'Node.js' } }),
      prisma.stack.create({ data: { name: 'TypeScript' } }),
    ]);
    sourceStackId = sourceStack.id;
    targetStackId = targetStack.id;
  });

  afterAll(async () => {
    await prisma.episode.deleteMany({});
    await prisma.stack.deleteMany({});
    await app.close();
  });

  test('should update an episode when payload is valid', async () => {
    const episode = await prisma.episode.create({
      data: {
        title: 'Test Episode',
        stackId: sourceStackId,
        error: 'Some error',
        solution: 'Some solution',
      },
    });

    const response = await request(app.getHttpServer())
      .put(`/episodes/${episode.id}`)
      .send({
        title: 'Updated Episode',
        stackId: targetStackId,
        error: 'Updated error',
        solution: 'Updated solution',
      })
      .expect(200);

    expect(response.body).toHaveProperty('episode');
    expect(response.body.episode.title).toEqual('Updated Episode');
    expect(response.body.episode.error).toEqual('Updated error');
    expect(response.body.episode.solution).toEqual('Updated solution');
    expect(response.body.episode.stackId).toEqual(targetStackId);
    expect(response.body.episode.stack).toMatchObject({
      id: targetStackId,
      name: 'TypeScript',
    });

    const episodeOnDatabase = await prisma.episode.findUnique({
      where: { id: episode.id },
    });
    expect(episodeOnDatabase?.stackId).toEqual(targetStackId);
  });

  test('should return 400 when payload is invalid', async () => {
    const episode = await prisma.episode.create({
      data: {
        title: 'Test Episode',
        stackId: sourceStackId,
        error: 'Some error',
        solution: 'Some solution',
      },
    });

    const response = await request(app.getHttpServer())
      .put(`/episodes/${episode.id}`)
      .send({
        title: 123,
      })
      .expect(400);

    expect(response.body.message).toEqual('Validation failed');
  });

  test('should return 404 when episode does not exist', async () => {
    const nonExistingId = '00000000-0000-0000-0000-000000000000';

    const response = await request(app.getHttpServer())
      .put(`/episodes/${nonExistingId}`)
      .send({
        title: 'Updated Episode',
        stackId: targetStackId,
        error: 'Updated error',
        solution: 'Updated solution',
      })
      .expect(404);

    expect(response.body).toHaveProperty('statusCode', 404);
    expect(response.body).toHaveProperty(
      'message',
      `Episode with ID ${nonExistingId} not found`,
    );
  });

  test('should return 400 when title is empty', async () => {
    const episode = await prisma.episode.create({
      data: {
        title: 'Test Episode',
        stackId: sourceStackId,
        error: 'Some error',
        solution: 'Some solution',
      },
    });

    await request(app.getHttpServer())
      .put(`/episodes/${episode.id}`)
      .send({
        title: '   ',
      })
      .expect(400);
  });
});
