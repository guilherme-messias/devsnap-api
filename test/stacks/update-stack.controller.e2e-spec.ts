import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@app';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { createTestUser } from '../helpers/create-test-user';
import { authenticateTestUser } from '../helpers/authenticate-test-user';

describe('Update Stack (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let stackId: string;
  let userId: string;
  let accessToken: string;
  let otherUserAccessToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService);

    await app.init();

    const { user, password } = await createTestUser(prisma);
    userId = user.id;

    const authentication = await authenticateTestUser(
      app,
      user.email,
      password,
    );
    accessToken = authentication.accessToken;

    const { user: otherUser, password: otherUserPassword } =
      await createTestUser(prisma);

    const otherAuthentication = await authenticateTestUser(
      app,
      otherUser.email,
      otherUserPassword,
    );
    otherUserAccessToken = otherAuthentication.accessToken;
  });

  afterAll(async () => {
    await prisma.stack.deleteMany({});
    await prisma.user.deleteMany();
    await app.close();
  });

  test('should update a stack when payload is valid', async () => {
    const stack = await prisma.stack.create({
      data: { name: 'Node.js', userId },
    });
    stackId = stack.id;

    const response = await request(app.getHttpServer())
      .patch(`/stacks/${stackId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Updated Stack Name',
      })
      .expect(200);

    expect(response.body).toHaveProperty('stack');
    expect(response.body.stack.name).toEqual('Updated Stack Name');
  });

  test('should return 400 when payload is invalid', async () => {
    const stack = await prisma.stack.create({
      data: { name: 'Node.js', userId },
    });
    stackId = stack.id;

    const response = await request(app.getHttpServer())
      .patch(`/stacks/${stackId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: '',
      })
      .expect(400);

    expect(response.body).toHaveProperty('statusCode', 400);
    expect(response.body.message).toEqual('Validation failed');
  });

  test('should return 404 when stack does not exist', async () => {
    const stack = await prisma.stack.create({
      data: { name: 'Node.js', userId },
    });
    stackId = stack.id;

    const nonExistentStackId = '00000000-0000-0000-0000-000000000000';

    const response = await request(app.getHttpServer())
      .patch(`/stacks/${nonExistentStackId}`)
      .set('Authorization', `Bearer ${accessToken}`)
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
    const stack = await prisma.stack.create({
      data: { name: 'Node.js', userId },
    });
    stackId = stack.id;

    const response = await request(app.getHttpServer())
      .patch(`/stacks/${stackId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: '',
      })
      .expect(400);

    expect(response.body).toHaveProperty('statusCode', 400);
    expect(response.body).toHaveProperty('message', 'Validation failed');
  });

  test('should return 401 when the authorization header is missing', async () => {
    const stack = await prisma.stack.create({
      data: { name: 'Node.js', userId },
    });
    stackId = stack.id;

    const response = await request(app.getHttpServer())
      .patch(`/stacks/${stackId}`)
      .send({
        name: 'Updated Stack Name',
      })
      .expect(401);

    expect(response.body.message).toBe('Unauthorized');

    const stackOnDatabase = await prisma.stack.findUnique({
      where: { id: stackId },
    });
    expect(stackOnDatabase).toMatchObject({ name: 'Node.js' });
  });

  test('should return 404 when the stack belongs to another user', async () => {
    const stack = await prisma.stack.create({
      data: { name: 'Node.js', userId },
    });
    stackId = stack.id;

    const response = await request(app.getHttpServer())
      .patch(`/stacks/${stackId}`)
      .set('Authorization', `Bearer ${otherUserAccessToken}`)
      .send({
        name: 'Hacked Stack Name',
      })
      .expect(404);

    expect(response.body).toHaveProperty('statusCode', 404);
    expect(response.body).toHaveProperty(
      'message',
      `Stack with ID ${stackId} not found`,
    );

    const stackOnDatabase = await prisma.stack.findUnique({
      where: { id: stackId },
    });
    expect(stackOnDatabase).toMatchObject({ name: 'Node.js' });
  });
});
