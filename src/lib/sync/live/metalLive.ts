/**
 * Live bullion rate fetcher.
 *
 * Pakistan's sarafa market publishes no machine-readable feed, so this
 * DERIVES an indicative PKR/tola rate from three free, no-key public APIs
 * fetched in parallel:
 *   1. XAU/USD spot (USD per troy ounce) — https://api.gold-api.com/price/XAU
 *   2. XAG/USD spot (USD per troy ounce) — https://api.gold-api.com/price/XAG
 *   3. USD/PKR rate                        — https://open.er-api.com/v6/latest/USD
 *
 * FORMULA (documented, do not silently change):
 *   PKR per tola = usdPerTroyOz × usdPkr × 0.375 × 1.02
 *   - 0.375: 1 tola = 11.6638 g = exactly 0.375 troy oz
 *            (11.6638 / 31.1034768 = 0.375).
 *   - 1.02: ~2% local sarafa premium over the raw converted spot, calibrated
 *           Oct 2026 (derived Rs. 429,950 vs APGJSA Rs. 436,336–440,636).
 *
 * The result is INDICATIVE — it tracks international spot, not the official
 * All Pakistan Sarafa Gems & Jewellers Association (APSGJA) announcement.
 * Every consumer must label it as derived/indicative (see source strings and
 * tool-sources.ts). Verified working 2026-10-04.
 */

import { fetchJson, LiveFetchError, FetchJsonOptions } from './http';

const XAU_URL = 'https://api.gold-api.com/price/XAU';
const XAG_URL = 'https://api.gold-api.com/price/XAG';
const FX_URL = 'https://open.er-api.com/v6/latest/USD';

/** 1 tola = 11.6638 g = exactly 0.375 troy ounces. */
export const TROY_OZ_PER_TOLA = 0.375;
/** ~2% local sarafa premium over converted international spot (calibrated Oct 2026). */
export const SARAF_PREMIUM = 1.02;

// Sanity bounds.
const XAU_MIN = 2000;
const XAU_MAX = 8000;
const XAG_MIN = 20;
const XAG_MAX = 200;
const USD_PKR_MIN = 200;
const USD_PKR_MAX = 350;
const GOLD_TOLA_MIN = 300_000;
const GOLD_TOLA_MAX = 600_000;
const SILVER_TOLA_MIN = 4_000;
const SILVER_TOLA_MAX = 10_000;
/** Reject a derived rate that jumps more than this vs the stored DB value (flash-crash guard). */
const MAX_JUMP_PCT = 12;

interface SpotResponse {
  price?: number;
  currency?: string;
  updatedAt?: string;
}

interface FxResponse {
  rates?: Record<string, number>;
  time_last_update_utc?: string;
}

/**
 * Pure conversion — the formula above. Exported for tests and transparency.
 */
export function tolaFromSpot(usdPerTroyOz: number, usdPkr: number): number {
  return usdPerTroyOz * usdPkr * TROY_OZ_PER_TOLA * SARAF_PREMIUM;
}

export interface LiveMetalResult {
  goldTola: number;
  silverTola: number;
  usdPkr: number;
  xauUsd: number;
  xagUsd: number;
  /** Upstream timestamps for provenance. */
  fxUpdatedAt: string;
  spotUpdatedAt: string;
  /** Honest provenance label — never claims to be the official sarafa rate. */
  source: string;
}

type FetchImpl = (url: string, opts?: FetchJsonOptions) => Promise<any>;

function finiteIn(v: unknown, min: number, max: number): v is number {
  return typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;
}

function checkJump(label: string, derived: number, stored: number | undefined): void {
  if (stored === undefined || stored <= 0) return; // no baseline — skip the guard
  const pct = (Math.abs(derived - stored) / stored) * 100;
  if (pct > MAX_JUMP_PCT) {
    throw new LiveFetchError(
      'validation',
      `${label}: derived Rs. ${Math.round(derived).toLocaleString()} differs ${pct.toFixed(1)}% from stored Rs. ${Math.round(stored).toLocaleString()} (>${MAX_JUMP_PCT}% guard) — rejected, keeping stored value`
    );
  }
}

export async function fetchLiveMetals(
  currentGoldTola?: number,
  currentSilverTola?: number,
  fetchImpl: FetchImpl = fetchJson
): Promise<LiveMetalResult> {
  const [xau, xag, fx] = await Promise.all([
    fetchImpl(XAU_URL) as Promise<SpotResponse>,
    fetchImpl(XAG_URL) as Promise<SpotResponse>,
    fetchImpl(FX_URL) as Promise<FxResponse>,
  ]);

  const xauUsd = xau?.price;
  const xagUsd = xag?.price;
  const usdPkr = fx?.rates?.PKR;

  if (!finiteIn(xauUsd, XAU_MIN, XAU_MAX)) {
    throw new LiveFetchError(
      'validation',
      `XAU spot ${String(xauUsd)} out of range (${XAU_MIN}-${XAU_MAX} USD/oz) — rejected`
    );
  }
  if (!finiteIn(xagUsd, XAG_MIN, XAG_MAX)) {
    throw new LiveFetchError(
      'validation',
      `XAG spot ${String(xagUsd)} out of range (${XAG_MIN}-${XAG_MAX} USD/oz) — rejected`
    );
  }
  if (!finiteIn(usdPkr, USD_PKR_MIN, USD_PKR_MAX)) {
    throw new LiveFetchError(
      'validation',
      `USD/PKR ${String(usdPkr)} out of range (${USD_PKR_MIN}-${USD_PKR_MAX}) — rejected`
    );
  }

  const goldTola = tolaFromSpot(xauUsd, usdPkr);
  const silverTola = tolaFromSpot(xagUsd, usdPkr);

  if (!(goldTola >= GOLD_TOLA_MIN && goldTola <= GOLD_TOLA_MAX)) {
    throw new LiveFetchError(
      'validation',
      `Derived gold Rs. ${Math.round(goldTola).toLocaleString()}/tola outside ${GOLD_TOLA_MIN.toLocaleString()}-${GOLD_TOLA_MAX.toLocaleString()} — rejected`
    );
  }
  if (!(silverTola >= SILVER_TOLA_MIN && silverTola <= SILVER_TOLA_MAX)) {
    throw new LiveFetchError(
      'validation',
      `Derived silver Rs. ${Math.round(silverTola).toLocaleString()}/tola outside ${SILVER_TOLA_MIN.toLocaleString()}-${SILVER_TOLA_MAX.toLocaleString()} — rejected`
    );
  }

  checkJump('Gold', goldTola, currentGoldTola);
  checkJump('Silver', silverTola, currentSilverTola);

  return {
    goldTola: Math.round(goldTola),
    silverTola: Math.round(silverTola),
    usdPkr,
    xauUsd,
    xagUsd,
    fxUpdatedAt: fx?.time_last_update_utc || '',
    spotUpdatedAt: xau?.updatedAt || '',
    source:
      'Live derived rate: international XAU/XAG spot × USD/PKR — indicative only; official APGJSA sarafa rates may differ slightly',
  };
}
