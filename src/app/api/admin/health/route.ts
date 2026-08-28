import { NextResponse } from 'next/server';
import { getDatabaseStatus } from '../../../../lib/db/dataProvider';

export async function GET() {
  try {
    const status = await getDatabaseStatus();
    return NextResponse.json(status);
  } catch (err: any) {
    return NextResponse.json(
      {
        connected: false,
        driver: 'Supabase PostgreSQL (Prisma ORM)',
        error: err.message,
        fallbackActive: true,
      },
      { status: 500 }
    );
  }
}
