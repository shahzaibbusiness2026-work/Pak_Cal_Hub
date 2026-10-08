import { NextResponse, NextRequest } from 'next/server';
import { syncFuelPrices } from '../../../../lib/sync/fuel';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const url = new URL(req.url);
    const querySecret = url.searchParams.get('secret');
    const cronSecret = process.env.CRON_SECRET;

    const isAuthorized =
      authHeader === `Bearer ${cronSecret}` ||
      querySecret === cronSecret ||
      process.env.NODE_ENV === 'development';

    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Invalid CRON_SECRET' }, { status: 401 });
    }

    const result = await syncFuelPrices();
    return NextResponse.json({
      success: result.success,
      updated: result.changesDetected > 0,
      rates: Object.fromEntries(result.changes.map((c) => [c.key, c.newValue])),
      changes: result.changes,
      source: result.syncMode || 'manual-verified',
      asOf: result.timestamp,
      message: result.message,
      ...(result.error ? { error: result.error } : {}),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
