import { PrismaClient } from '@prisma/client';

const withMongoTimeouts = (url?: string) => {
  if (!url) return url;
  if (/serverSelectionTimeoutMS=/.test(url)) return url;
  const join = url.includes('?') ? '&' : '?';
  return `${url}${join}serverSelectionTimeoutMS=8000&connectTimeoutMS=8000`;
};

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: process.env.DATABASE_URL
      ? { db: { url: withMongoTimeouts(process.env.DATABASE_URL) } }
      : undefined,
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const connectDatabase = async () => {
  await prisma.$connect();
  await Promise.race([
    prisma.$runCommandRaw({ ping: 1 }),
    new Promise((_, reject) => setTimeout(() => reject(new Error('database ping timed out')), 8000)),
  ]);
};
