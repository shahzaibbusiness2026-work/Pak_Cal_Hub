import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { checkDatabaseConnection } from '../../../../lib/db/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password, secretKey } = body;

    const expectedSecret = process.env.ADMIN_SECRET_KEY || 'pakcalc2026';
    if (secretKey && secretKey !== expectedSecret) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Invalid Admin Secret Key' }, { status: 401 });
    }

    if (!password || password.trim() === '') {
      return NextResponse.json({ success: false, error: 'Please enter a valid database password.' }, { status: 400 });
    }

    const cleanPass = password.trim();
    // Encode special characters in password for URI safety
    const encodedPass = encodeURIComponent(cleanPass);

    const targetPoolerUrl = `postgresql://postgres.pwurutzomtjwaansduup:${encodedPass}@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true`;
    const targetDirectUrl = `postgresql://postgres.pwurutzomtjwaansduup:${encodedPass}@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres`;

    // 1. Test connection with temporary PrismaClient
    const tempPrisma = new PrismaClient({
      datasources: {
        db: {
          url: targetPoolerUrl,
        },
      },
    });

    try {
      await tempPrisma.$queryRaw`SELECT 1`;
    } catch (connErr: any) {
      await tempPrisma.$disconnect();
      return NextResponse.json({
        success: false,
        error: `Authentication Rejected: ${connErr.message || 'Incorrect password or unreachable Supabase host.'}`,
      }, { status: 400 });
    }

    await tempPrisma.$disconnect();

    // 2. Update .env file
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Replace or write DATABASE_URL and DIRECT_URL
    const newDbLine = `DATABASE_URL="${targetPoolerUrl}"`;
    const newDirectLine = `DIRECT_URL="${targetDirectUrl}"`;

    if (envContent.includes('DATABASE_URL=')) {
      envContent = envContent.replace(/DATABASE_URL=.*/g, newDbLine);
    } else {
      envContent += `\n${newDbLine}`;
    }

    if (envContent.includes('DIRECT_URL=')) {
      envContent = envContent.replace(/DIRECT_URL=.*/g, newDirectLine);
    } else {
      envContent += `\n${newDirectLine}`;
    }

    fs.writeFileSync(envPath, envContent, 'utf8');

    // Update current process env
    process.env.DATABASE_URL = targetPoolerUrl;
    process.env.DIRECT_URL = targetDirectUrl;

    return NextResponse.json({
      success: true,
      message: 'Supabase PostgreSQL connected and authenticated successfully! You can now run "1-Click Database Seed".',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
