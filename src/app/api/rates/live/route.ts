import { NextResponse } from 'next/server';
import { getMarketRates } from '../../../../lib/db/dataProvider';
import { buildLiveRatesResponse } from '../../../../lib/sync/live/liveRatesPayload';

export const dynamic = 'force-dynamic';

/**
 * Public live-rates endpoint consumed client-side by DynamicCalculator.
 *
 * Returns the freshest stored rates (DB first, manually verified constants as
 * fallback). Values here are whatever the sync pipeline last published —
 * live-fetched when the upstream APIs cooperated, manual constants otherwise.
 * The `live` flag and `sources` say which; never implied.
 */
export async function GET() {
  try {
    const rates = await getMarketRates();
    const payload = buildLiveRatesResponse(rates);
    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch {
    // Even the fallback path failed — serve hardcoded constants, honestly labeled.
    const payload = buildLiveRatesResponse([]);
    return NextResponse.json(
      { ...payload, live: false, error: 'Rate store unreachable; serving fallback constants.' },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
        },
      }
    );
  }
}
