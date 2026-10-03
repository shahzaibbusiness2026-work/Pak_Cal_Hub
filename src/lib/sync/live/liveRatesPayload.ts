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
  /** ISO timestamp of the freshest rate in the payload. */
  asOf: string;
  /** Provenance per rate key. */
  sources: Record<string, string>;
  /** True when at least one rate was published by the live-sync pipeline. */
  live: boolean;
}

export const LIVE_RATES_FALLBACKS: Record<
  keyof Omit<LiveRatesPayload, 'asOf' | 'sources' | 'live'>,
  number
> = {
  petrol: 392.76,
  diesel: 399.64,
  gold24kTola: 440636,
  silverTola: 6528,
  usdPkr: 277.1,
};

/** Pure shape builder — unit-tested without network or DB. */
export function buildLiveRatesResponse(rates: MarketRateRecord[]): LiveRatesPayload {
  const byKey = new Map(rates.map((r) => [r.key, r]));
  const pick = (key: string, fallback: number): { value: number; source: string; at: string } => {
    const r = byKey.get(key);
    const at = r?.verifiedAt
      ? new Date(r.verifiedAt).toISOString()
      : r?.updatedAt
        ? new Date(r.updatedAt).toISOString()
        : new Date(0).toISOString();
    return {
      value: r && Number.isFinite(r.value) ? r.value : fallback,
      source: r?.source || 'Manually verified fallback constant',
      at,
    };
  };

  const petrol = pick('petrol', LIVE_RATES_FALLBACKS.petrol);
  const diesel = pick('diesel', LIVE_RATES_FALLBACKS.diesel);
  const gold = pick('gold_24k_tola', LIVE_RATES_FALLBACKS.gold24kTola);
  const silver = pick('silver_tola', LIVE_RATES_FALLBACKS.silverTola);
  const fx = pick('usd_pkr', LIVE_RATES_FALLBACKS.usdPkr);

  const asOf = [petrol.at, diesel.at, gold.at, silver.at, fx.at].sort().reverse()[0];
  const live = rates.some(
    (r) =>
      ['petrol', 'diesel', 'gold_24k_tola', 'silver_tola'].includes(r.key) &&
      r.updatedBy === 'live-sync'
  );

  return {
    petrol: petrol.value,
    diesel: diesel.value,
    gold24kTola: gold.value,
    silverTola: silver.value,
    usdPkr: fx.value,
    asOf,
    sources: {
      petrol: petrol.source,
      diesel: diesel.source,
      gold24kTola: gold.source,
      silverTola: silver.source,
      usdPkr: fx.source,
    },
    live,
  };
}
