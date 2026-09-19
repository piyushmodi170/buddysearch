import { PrismaClient } from '@prisma/client';

const atlasUrl = (url?: string) => {
  if (!url) return url;
  const join = url.includes('?') ? '&' : '?';
  const extras: string[] = [];
  if (!/[?&]tls=/.test(url) && !/[?&]ssl=/.test(url) && url.includes('mongodb+srv://')) {
    extras.push('tls=true');
  }
  if (!/[?&]retryWrites=/.test(url)) extras.push('retryWrites=true');
  return extras.length ? `${url}${join}${extras.join('&')}` : url;
};

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: process.env.DATABASE_URL
      ? { db: { url: atlasUrl(process.env.DATABASE_URL) } }
      : undefined,
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const isDatabaseError = (err: unknown) => {
  const text = String((err as any)?.message || err || '');
  return /prisma|mongodb|replica|server selection|tls|atlas|database ping/i.test(text);
};

export const publicDatabaseError =
  'Cannot reach the database. In MongoDB Atlas → Network Access, add 0.0.0.0/0 (or your Coolify server IP), then try again.';

export const connectDatabase = async () => {
  let last: unknown;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      await prisma.$connect();
      await prisma.$runCommandRaw({ ping: 1 });
      return;
    } catch (err) {
      last = err;
      console.error(`[database] connect attempt ${attempt} failed`, (err as any)?.message || err);
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
  throw last;
};
