import { PrismaClient } from '@prisma/client';
import { repairBrokenUsers } from './mongo.js';

const cleanDatabaseUrl = (url?: string) => {
  if (!url) return url;
  return url.trim().replace(/^["']|["']$/g, '');
};

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const databaseUrl = cleanDatabaseUrl(process.env.DATABASE_URL);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: databaseUrl ? { db: { url: databaseUrl } } : undefined,
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export { isDatabaseError, publicAuthError, publicDatabaseError } from './db-errors.js';

export const databaseUrlInfo = () => {
  const url = databaseUrl || '';
  let host = '';
  try {
    host = url ? new URL(url.replace('mongodb+srv://', 'https://').replace('mongodb://', 'https://')).host : '';
  } catch {
    host = '';
  }
  return {
    configured: Boolean(url),
    protocol: url.startsWith('mongodb+srv://') ? 'mongodb+srv' : url.startsWith('mongodb://') ? 'mongodb' : 'missing',
    host,
  };
};

export const lookupOutboundIp = async () => {
  try {
    const res = await fetch('https://api.ipify.org?format=json', {
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return null;
    const body = await res.json() as { ip?: string };
    return body.ip || null;
  } catch {
    return null;
  }
};

export const connectDatabase = async () => {
  let last: unknown;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      await prisma.$connect();
      await prisma.$runCommandRaw({ ping: 1 });
      try {
        const repaired = await repairBrokenUsers();
        if (repaired) console.log(`[database] repaired ${repaired} user document(s)`);
      } catch (repairErr) {
        console.error('[database] user repair failed', (repairErr as any)?.message || repairErr);
      }
      return;
    } catch (err) {
      last = err;
      console.error(`[database] connect attempt ${attempt} failed`, (err as any)?.message || err);
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
  throw last;
};
