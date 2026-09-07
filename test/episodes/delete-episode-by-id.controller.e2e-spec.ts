import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@src/app.module';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';
import { createTestUser } from '../helpers/create-test-user';
import { authenticateTestUser } from '../helpers/authenticate-test-user';

describe('Delete Episode By Id (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let stackId: string;
  let accessToken: string;
  let otherAccessToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService);

    await app.init();

    const { user, password } = await createTestUser(prisma);
    const stack = await prisma.stack.create({
      data: { name: 'Node.js', userId: user.id },
    });
    stackId = stack.id;

    const auth = await authenticateTestUser(app, user.email, password);
    accessToken = auth.accessToken;

    const { user: otherUser, password: otherPassword } =
      await createTestUser(prisma);
    await prisma.stack.create({
      data: { name: 'Go', userId: otherUser.id },
    });

    const otherAuth = await authenticateTestUser(
      app,
      otherUser.email,
      otherPassword,
    );
    otherAccessToken = otherAuth.accessToken;
  });

  afterAll(async () => {
    await prisma.episode.deleteMany({});
    await prisma.stack.deleteMany({});
    await prisma.user.deleteMany();
    await app.close();
  });

  test('should delete the episode by id', async () => {
    const episode = await prisma.episode.create({
      data: {
        title: 'Test Episode',
        stackId,
        error: 'Some error',
        solution: 'Some solution',
      },
    });

    await request(app.getHttpServer())
      .delete(`/episodes/${episode.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);

    const deletedEpisode = await prisma.episode.findUnique({
      where: { id: episode.id },
    });
    expect(deletedEpisode).toBeNull();
  });

  test('should return 404 for non-existing episode id', async () => {
    const nonExistingId = '00000000-0000-0000-0000-000000000000';

    const response = await request(app.getHttpServer())
      .delete(`/episodes/${nonExistingId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);

    expect(response.body).toHaveProperty('statusCode', 404);
    expect(response.body).toHaveProperty(
      'message',
      `Episode with ID ${nonExistingId} not found`,
    );
  });

  test('should return 400 for invalid episode id', async () => {
    const invalidId = 'invalid-uuid';

    const response = await request(app.getHttpServer())
      .delete(`/episodes/${invalidId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);

    expect(response.body).toHaveProperty('statusCode', 400);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Validation failed');
  });

  test('should return 401 when no authorization header is provided', async () => {
    const episode = await prisma.episode.create({
      data: {
        title: 'Unauthenticated Episode',
        stackId,
        error: 'Some error',
        solution: 'Some solution',
      },
    });

    await request(app.getHttpServer())
      .delete(`/episodes/${episode.id}`)
      .expect(401);

    const episodeOnDatabase = await prisma.episode.findUnique({
      where: { id: episode.id },
    });
    expect(episodeOnDatabase).toBeTruthy();
  });

  test('should return 404 when the episode belongs to another user', async () => {
    const episode = await prisma.episode.create({
      data: {
        title: 'Owner Episode',
        stackId,
        error: 'Some error',
        solution: 'Some solution',
      },
    });

    const response = await request(app.getHttpServer())
      .delete(`/episodes/${episode.id}`)
      .set('Authorization', `Bearer ${otherAccessToken}`)
      .expect(404);

    expect(response.body).toHaveProperty('statusCode', 404);
    expect(response.body).toHaveProperty(
      'message',
      `Episode with ID ${episode.id} not found`,
    );

    const episodeOnDatabase = await prisma.episode.findUnique({
      where: { id: episode.id },
    });
    expect(episodeOnDatabase).toBeTruthy();
  });
});
