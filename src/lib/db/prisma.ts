import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export interface DbConnectionCheck {
  connected: boolean;
  reason: string;
  hasPlaceholder: boolean;
  host: string;
  driver: string;
}

/**
 * Detailed database connectivity check with descriptive diagnostics
 */
export async function checkDatabaseConnection(): Promise<DbConnectionCheck> {
  const dbUrl = process.env.DATABASE_URL || '';

  if (!dbUrl) {
    return {
      connected: false,
      reason: 'DATABASE_URL environment variable is not defined.',
      hasPlaceholder: false,
      host: 'None',
      driver: 'Supabase PostgreSQL (Prisma ORM)',
    };
  }

  if (dbUrl.includes('[YOUR-PASSWORD]')) {
    return {
      connected: false,
      reason: 'Database password placeholder [YOUR-PASSWORD] is still present in .env.',
      hasPlaceholder: true,
      host: 'aws-0-ap-northeast-2.pooler.supabase.com:6543',
      driver: 'Supabase PostgreSQL (Prisma ORM)',
    };
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      connected: true,
      reason: 'Successfully authenticated and connected to Supabase PostgreSQL.',
      hasPlaceholder: false,
      host: 'aws-0-ap-northeast-2.pooler.supabase.com:6543 (Connected)',
      driver: 'Supabase PostgreSQL (Prisma ORM)',
    };
  } catch (err: any) {
    let specificReason = err.message || 'Unknown database connection error';
    if (specificReason.includes('password authentication failed') || specificReason.includes('P1000')) {
      specificReason = 'Authentication Failed: The database password in .env was rejected by Supabase.';
    } else if (specificReason.includes('Can\'t reach database server') || specificReason.includes('P1001')) {
      specificReason = 'Network Timeout: Unable to reach the Supabase host. Check your internet connection or pooler host.';
    }

    return {
      connected: false,
      reason: specificReason,
      hasPlaceholder: false,
      host: 'aws-0-ap-northeast-2.pooler.supabase.com:6543',
      driver: 'Supabase PostgreSQL (Prisma ORM)',
    };
  }
}

/**
 * Fast boolean check for queries
 */
export async function isDatabaseConnected(): Promise<boolean> {
  const check = await checkDatabaseConnection();
  return check.connected;
}
