import { PrismaClient } from '@prisma/client';

// Global variable to store Prisma instance in development (prevents multiple instances during Next.js hot-reload)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Quick helper to test database connectivity safely without throwing unhandled exceptions
 */
export async function isDatabaseConnected(): Promise<boolean> {
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('[YOUR-PASSWORD]')) {
    return false;
  }
  try {
    // Quick lightweight query
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (err) {
    return false;
  }
}
