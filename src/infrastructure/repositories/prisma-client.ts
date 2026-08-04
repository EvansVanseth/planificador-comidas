import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const SESSION_POOLER_PORT = 5432;
const TRANSACTION_POOLER_PORT = 6543;

export function resolveConnectionString(raw: string): string {
  let url = raw;

  const match = url.match(/^(.+@)?([^:/?#]+):(\d+)(\/.*)?$/);
  if (match) {
    const [, credentials, host, port, rest] = match;
    if (host.endsWith('pooler.supabase.com') && Number(port) === SESSION_POOLER_PORT) {
      url = `${credentials ?? ''}${host}:${TRANSACTION_POOLER_PORT}${rest ?? ''}`;
    }
  }

  if (url.includes('connection_limit=')) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}connection_limit=1`;
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter: new PrismaPg({
    connectionString: resolveConnectionString(process.env.DATABASE_URL ?? ''),
    max: 1,
    idleTimeoutMillis: 1_000,
    connectionTimeoutMillis: 10_000,
  }),
});

globalForPrisma.prisma = prisma;
