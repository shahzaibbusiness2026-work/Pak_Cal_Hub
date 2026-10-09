import { NextResponse } from 'next/server';
import { getMarketRates } from '../../../../lib/db/dataProvider';
import { buildLiveRatesResponse, LiveRatesOverlay } from '../../../../lib/sync/live/liveRatesPayload';
import { fetchLiveFx } from '../../../../lib/sync/live/fxLive';
import { fetchLiveMetals } from '../../../../lib/sync/live/metalLive';
import { fetchLiveFuel } from '../../../../lib/sync/live/fuelLive';
import { getSiteSettings } from '../../../../lib/cms/settings';
import { parseRateOverrides } from '../../../../lib/cms/overrides';

export const dynamic = 'force-dynamic';

/**
 * Public live-rates endpoint consumed client-side by DynamicCalculator.
 *
 * On each (CDN-cached) request it first tries the genuinely-live upstreams —
 * mid-market FX and spot bullion (free, no-key APIs) and the fuel-price feed —
 * and overlays whatever succeeds onto the freshest stored rates (DB first,
 * manually verified constants as fallback). Every value carries its source
 * string; `live` is true only when at least one upstream fetch succeeded.
 * Nothing here ever invents a number: failed fetches fall back, visibly.
 */
export async function GET() {
  try {
    const rates = await getMarketRates();
    const storedGold = rates.find((r) => r.key === 'gold_24k_tola')?.value;
    const storedSilver = rates.find((r) => r.key === 'silver_tola')?.value;

    const [fxRes, metalsRes, fuelRes] = await Promise.allSettled([
      fetchLiveFx(),
      fetchLiveMetals(storedGold, storedSilver),
      fetchLiveFuel(),
    ]);

    const overlay: LiveRatesOverlay = { sources: {} };
    if (fxRes.status === 'fulfilled') {
      overlay.usdPkr = fxRes.value.usdPkr;
      overlay.fx = fxRes.value.fx;
      overlay.sources!.usdPkr = fxRes.value.source;
    }
    if (metalsRes.status === 'fulfilled') {
      overlay.gold24kTola = metalsRes.value.goldTola;
      overlay.silverTola = metalsRes.value.silverTola;
      overlay.sources!.gold24kTola = metalsRes.value.source;
      overlay.sources!.silverTola = metalsRes.value.source;
      // The metals pipeline derives its own USD/PKR from the same FX source;
      // prefer the dedicated FX fetch when both succeeded (already set above).
      if (!overlay.usdPkr) overlay.usdPkr = metalsRes.value.usdPkr;
      // Keep the FX map internally consistent with the metals snapshot if the
      // dedicated FX fetch failed but metals produced a USD/PKR.
      if (!overlay.fx && overlay.usdPkr) overlay.fx = { PKR: 1, USD: overlay.usdPkr };
    }
    if (fuelRes.status === 'fulfilled') {
      overlay.petrol = fuelRes.value.petrol;
      overlay.diesel = fuelRes.value.diesel;
      overlay.sources!.petrol = fuelRes.value.source;
      overlay.sources!.diesel = fuelRes.value.source;
    }

    // Owner's manual rate pins (Admin → Market Rates / Site Content) fill any
    // gap a live upstream left — fresh upstream quotes always win.
    try {
      const pins = parseRateOverrides(await getSiteSettings());
      const pin = (key: 'petrol' | 'diesel' | 'gold24kTola' | 'silverTola' | 'usdPkr') => {
        const v = pins[key];
        if (typeof v === 'number' && (overlay as any)[key] == null) {
          (overlay as any)[key] = v;
          (overlay.sources as any)[key] = 'Admin manual pin (CMS)';
        }
      };
      pin('petrol');
      pin('diesel');
      pin('gold24kTola');
      pin('silverTola');
      pin('usdPkr');
      if ((overlay as any).usdPkr != null && !overlay.fx) overlay.fx = { PKR: 1, USD: (overlay as any).usdPkr };
    } catch {
      /* settings unavailable — fallbacks apply */
    }

    const payload = buildLiveRatesResponse(rates, overlay);
    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=3600',
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
