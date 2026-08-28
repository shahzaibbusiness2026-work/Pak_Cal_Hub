import { NextResponse, NextRequest } from 'next/server';
import { syncElectricityTariffs } from '../../../../lib/sync/electricity';

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

    const result = await syncElectricityTariffs();
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
