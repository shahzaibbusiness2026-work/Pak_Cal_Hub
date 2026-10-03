import { NextResponse, NextRequest } from 'next/server';
import { prisma, isDatabaseConnected } from '../../../../lib/db/prisma';
import { updateMarketRate, DEFAULT_MARKET_RATES } from '../../../../lib/db/dataProvider';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const url = new URL(req.url);
    const querySecret = url.searchParams.get('secret');
    const cronSecret = process.env.CRON_SECRET || 'pakcalc_cron_secret_2026';

    const isAuthorized =
      authHeader === `Bearer ${cronSecret}` ||
      querySecret === cronSecret ||
      process.env.NODE_ENV === 'development';

    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Invalid CRON_SECRET' }, { status: 401 });
    }

    const connected = await isDatabaseConnected();
    if (!connected) {
      return NextResponse.json({
        success: true,
        message: 'Database is in hybrid fallback mode. Cron skipped live PostgreSQL write.',
        timestamp: new Date().toISOString(),
      });
    }

    // Daily publish of MANUALLY VERIFIED rate constants (no live feed exists for
    // OGRA / SBP / Sarafa — the cron republishes the verified constants in code).
    const syncResults = [];
    for (const rate of DEFAULT_MARKET_RATES) {
      const updated = await updateMarketRate(
        rate.key,
        rate.value,
        rate.label,
        rate.unit,
        rate.category,
        'Vercel Cron Service',
        rate.source || 'Manually verified benchmark constants'
      );
      syncResults.push({ key: rate.key, value: rate.value, status: 'published' });
    }

    return NextResponse.json({
      success: true,
      message: 'Manually verified market-rate constants republished successfully (no live feed — see verified dates).',
      syncedCount: syncResults.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
