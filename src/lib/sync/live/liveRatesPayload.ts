import { MarketRateRecord } from '../../db/dataProvider';

/**
 * Pure payload builder for the public /api/rates/live endpoint.
 *
 * Lives outside the route file because Next.js only allows specific exports
 * from a route module. Unit-tested without network or DB.
 */
export interface LiveRatesPayload {
  petrol: number;
  diesel: number;
  gold24kTola: number;
  silverTola: number;
  usdPkr: number;
  /** PKR per 1 unit of foreign currency, keyed by ISO code (includes PKR: 1). */
  fx: Record<string, number>;
  /** ISO timestamp of the freshest rate in the payload. */
  asOf: string;
  asOfByRate: Record<string, string>;
  /** Provenance per rate key. */
  sources: Record<string, string>;
  /** True when at least one rate was published by the live-sync pipeline. */
  live: boolean;
  liveByRate: Record<string, boolean>;
}

/** Optional live overlay applied over DB/fallback values (used by the route after an upstream fetch). */
export interface LiveRatesOverlay {
  liveByRate?: Record<string, boolean>;
  asOfByRate?: Record<string, string>;
  petrol?: number;
  diesel?: number;
  gold24kTola?: number;
  silverTola?: number;
  usdPkr?: number;
  fx?: Record<string, number>;
  sources?: Partial<Record<'petrol' | 'diesel' | 'gold24kTola' | 'silverTola' | 'usdPkr', string>>;
}

export const LIVE_RATES_FALLBACKS: Record<
  'petrol' | 'diesel' | 'gold24kTola' | 'silverTola' | 'usdPkr',
  number
> = {
  petrol: 362.00,
  diesel: 387.81,
  gold24kTola: 435636,
  silverTola: 5763,
  usdPkr: 276.7040,
};

/** Pure shape builder — unit-tested without network or DB. */
export function buildLiveRatesResponse(rates: MarketRateRecord[], overlay?: LiveRatesOverlay): LiveRatesPayload {
  const byKey = new Map(rates.map((r) => [r.key, r]));
  const pick = (key: string, fallback: number): { value: number; source: string; at: string } => {
    const r = byKey.get(key);
    const fallbackDates: Record<string, string> = { petrol: '2026-11-05', diesel: '2026-11-05', gold_24k_tola: '2026-11-05', silver_tola: '2026-11-05', usd_pkr: '2026-11-04' };
    const candidateDate = r?.verifiedAt || r?.updatedAt || fallbackDates[key];
    const at = candidateDate && Number.isFinite(new Date(candidateDate).getTime()) ? new Date(candidateDate).toISOString() : new Date(0).toISOString();
    return {
      value: r && Number.isFinite(r.value) && r.value > 0 ? r.value : fallback,
      source: r?.source || 'Manually verified fallback constant',
      at,
    };
  };

  const petrol = pick('petrol', LIVE_RATES_FALLBACKS.petrol);
  const diesel = pick('diesel', LIVE_RATES_FALLBACKS.diesel);
  const gold = pick('gold_24k_tola', LIVE_RATES_FALLBACKS.gold24kTola);
  const silver = pick('silver_tola', LIVE_RATES_FALLBACKS.silverTola);
  const fxUsd = pick('usd_pkr', LIVE_RATES_FALLBACKS.usdPkr);

  // FX map (PKR per 1 unit). Seeded from stored rows where present, then the
  // overlay's live map wins outright — it is internally consistent (all codes
  // derived from one upstream snapshot).
  const FXCODES = ['USD', 'GBP', 'EUR', 'AED', 'SAR', 'CAD', 'AUD', 'CNY', 'QAR', 'KWD', 'JPY', 'TRY'];
  const fx: Record<string, number> = { PKR: 1 };
  for (const code of FXCODES) {
    const stored = byKey.get(`${code.toLowerCase()}_pkr`);
    if (stored && Number.isFinite(stored.value) && stored.value > 0) fx[code] = stored.value;
  }
  if (!fx.USD) fx.USD = fxUsd.value;
  if (overlay?.fx) {
    for (const [code, v] of Object.entries(overlay.fx)) {
      if (Number.isFinite(v) && v > 0) fx[code] = v;
    }
  }
  if (overlay?.usdPkr && Number.isFinite(overlay.usdPkr)) fx.USD = overlay.usdPkr;

  const overlayDates = Object.values(overlay?.asOfByRate || {}).filter((value) => Number.isFinite(Date.parse(value))).map((value) => new Date(value).toISOString());
  const asOf = [petrol.at, diesel.at, gold.at, silver.at, fxUsd.at, ...overlayDates].sort().reverse()[0];
  const live = overlay?.liveByRate ? Object.values(overlay.liveByRate).some(Boolean) : rates.some(
    (r) =>
      ['petrol', 'diesel', 'gold_24k_tola', 'silver_tola'].includes(r.key) &&
      r.updatedBy === 'live-sync'
  ) || Boolean(overlay && (overlay.petrol || overlay.gold24kTola || overlay.fx || overlay.usdPkr));

  const num = (v: number | undefined, fallback: number) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : fallback);

  return {
    petrol: num(overlay?.petrol, petrol.value),
    diesel: num(overlay?.diesel, diesel.value),
    gold24kTola: num(overlay?.gold24kTola, gold.value),
    silverTola: num(overlay?.silverTola, silver.value),
    usdPkr: num(overlay?.usdPkr, fxUsd.value),
    fx,
    asOf,
    asOfByRate: { petrol: petrol.at, diesel: diesel.at, gold24kTola: gold.at, silverTola: silver.at, usdPkr: fxUsd.at, ...overlay?.asOfByRate },
    sources: {
      petrol: overlay?.sources?.petrol || petrol.source,
      diesel: overlay?.sources?.diesel || diesel.source,
      gold24kTola: overlay?.sources?.gold24kTola || gold.source,
      silverTola: overlay?.sources?.silverTola || silver.source,
      usdPkr: overlay?.sources?.usdPkr || fxUsd.source,
    },
    live,
    liveByRate: overlay?.liveByRate || {},
  };
}
