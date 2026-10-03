/**
 * Live fuel price fetcher.
 *
 * Source: autoones.com free fuel-prices API (no key, free forever), which
 * republishes OGRA-notified ex-depot prices. This is an AGGREGATOR, not OGRA
 * itself — every consumer of this data must label it as such (see source
 * strings below and tool-sources.ts). Verified working 2026-10-04.
 *
 * Docs: https://autoones.com/fuel-prices-api
 */

import { fetchJson, LiveFetchError, FetchJsonOptions } from './http';

const FUEL_API_URL = 'https://api2.autoones.com/api/fuel-prices';

// Sanity bounds — reject anything outside plausible Pakistani pump prices.
const MIN_PRICE = 150;
const MAX_PRICE = 600;
// The upstream feed should be fresher than this; older = treat as stale.
const MAX_DATA_AGE_DAYS = 21;

interface AutoonesPrice {
  fuel?: string;
  slug?: string;
  price_pkr?: number;
  effective_date?: string;
}

interface AutoonesResponse {
  prices?: AutoonesPrice[];
  source?: string;
}

export interface LiveFuelResult {
  petrol: number;
  diesel: number;
  /** Upstream effective_date, e.g. '2026-10-03'. */
  effectiveDate: string;
  /** Honest provenance label — never claims to be OGRA itself. */
  source: string;
  sourceUrl: string;
}

function isSanePrice(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v) && v >= MIN_PRICE && v <= MAX_PRICE;
}

function daysSince(dateStr: string): number | null {
  const t = new Date(dateStr + 'T00:00:00Z').getTime();
  if (Number.isNaN(t)) return null;
  return (Date.now() - t) / 86400000;
}

export async function fetchLiveFuel(
  fetchImpl: (url: string, opts?: FetchJsonOptions) => Promise<AutoonesResponse> = fetchJson,
  now: Date = new Date()
): Promise<LiveFuelResult> {
  const data = await fetchImpl(FUEL_API_URL);

  if (!data || !Array.isArray(data.prices)) {
    throw new LiveFetchError('validation', 'Fuel API: missing `prices` array in response');
  }

  const petrolEntry = data.prices.find((p) => p.slug === 'petrol');
  const dieselEntry = data.prices.find((p) => p.slug === 'diesel');

  if (!petrolEntry || !dieselEntry) {
    throw new LiveFetchError('validation', 'Fuel API: petrol/diesel entries not found in response');
  }

  if (!isSanePrice(petrolEntry.price_pkr)) {
    throw new LiveFetchError(
      'validation',
      `Fuel API: petrol price out of range (${String(petrolEntry.price_pkr)} PKR/L; expected ${MIN_PRICE}-${MAX_PRICE})`
    );
  }
  if (!isSanePrice(dieselEntry.price_pkr)) {
    throw new LiveFetchError(
      'validation',
      `Fuel API: diesel price out of range (${String(dieselEntry.price_pkr)} PKR/L; expected ${MIN_PRICE}-${MAX_PRICE})`
    );
  }

  // Petrol and diesel track each other; a wild ratio means a bad feed.
  const ratio = petrolEntry.price_pkr / dieselEntry.price_pkr;
  if (!(ratio >= 0.5 && ratio <= 2.0)) {
    throw new LiveFetchError(
      'validation',
      `Fuel API: petrol/diesel ratio ${ratio.toFixed(2)} is implausible — feed rejected`
    );
  }

  const effectiveDate = petrolEntry.effective_date || dieselEntry.effective_date || '';
  const age = effectiveDate ? daysSince(effectiveDate) : null;
  if (age === null || age < 0 || age > MAX_DATA_AGE_DAYS) {
    throw new LiveFetchError(
      'validation',
      `Fuel API: effective_date '${effectiveDate || 'missing'}' is stale or invalid (older than ${MAX_DATA_AGE_DAYS} days)`
    );
  }

  return {
    petrol: petrolEntry.price_pkr,
    diesel: dieselEntry.price_pkr,
    effectiveDate,
    source:
      'Live via autoones.com fuel-prices API (free aggregator republishing OGRA-notified ex-depot prices — not OGRA itself)',
    sourceUrl: 'https://autoones.com/fuel-prices-api',
  };
}
