import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { execSync } from 'node:child_process';

let prisma: PrismaClient;

function generateUniqueDatabaseURL(schemaId: string) {
  if (!process.env.TEST_DATABASE_URL) {
    throw new Error('Please provide a TEST_DATABASE_URL environment variable');
  }

  const url = new URL(process.env.TEST_DATABASE_URL);

  url.searchParams.set('schema', schemaId);

  return url.toString();
}

const schemaId = randomUUID();

beforeAll(async () => {
  const databaseURL = generateUniqueDatabaseURL(schemaId);

  process.env.TEST_DATABASE_URL = databaseURL;
  process.env.DATABASE_URL = databaseURL;

  prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseURL }),
  });

  execSync('npm exec prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: databaseURL },
    stdio: 'inherit',
  });
});

afterAll(async () => {
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`);
  await prisma.$disconnect();
});
