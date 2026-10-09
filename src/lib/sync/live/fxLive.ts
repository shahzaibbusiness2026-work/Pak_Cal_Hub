/**
 * Live foreign-exchange fetcher.
 *
 * Source: open.er-api.com — the free, no-key endpoint of exchangerate-api.com,
 * which publishes mid-market rates updated once daily (this is the same FX
 * source the bullion pipeline uses for USD/PKR). SBP publishes no public
 * machine-readable feed, so these are INDICATIVE mid-market rates, not the
 * official SBP closing — consumers must label them as such.
 *
 * Returns PKR per 1 unit of each supported currency (e.g. USD -> 277.4 means
 * 1 USD = Rs 277.4). Verified working 2026-10-09.
 */

import { fetchJson, LiveFetchError, FetchJsonOptions } from './http';

const FX_URL = 'https://open.er-api.com/v6/latest/USD';

/** Currencies the PKR converter supports. */
export const FX_CODES = ['USD', 'GBP', 'EUR', 'AED', 'SAR', 'CAD', 'AUD', 'CNY', 'QAR', 'KWD', 'JPY', 'TRY'] as const;

// Sanity bounds for the USD/PKR anchor (rejects garbage payloads).
const USD_PKR_MIN = 200;
const USD_PKR_MAX = 350;

interface FxResponse {
  result?: string;
  rates?: Record<string, number>;
  time_last_update_utc?: string;
}

export interface LiveFxResult {
  /** PKR per 1 unit of foreign currency, keyed by ISO code (PKR itself = 1). */
  fx: Record<string, number>;
  usdPkr: number;
  /** Upstream daily-update timestamp (UTC string as published). */
  updatedUtc: string;
  /** Honest provenance label — never claims to be the SBP official rate. */
  source: string;
}

export async function fetchLiveFx(
  fetchImpl: (url: string, opts?: FetchJsonOptions) => Promise<FxResponse> = fetchJson
): Promise<LiveFxResult> {
  const data = await fetchImpl(FX_URL);
  const rates = data?.rates;
  if (!rates || typeof rates !== 'object') {
    throw new LiveFetchError('validation', 'open.er-api response has no rates object');
  }
  const usdPkr = rates.PKR;
  if (typeof usdPkr !== 'number' || !Number.isFinite(usdPkr) || usdPkr < USD_PKR_MIN || usdPkr > USD_PKR_MAX) {
    throw new LiveFetchError('validation', `open.er-api USD/PKR ${String(usdPkr)} outside sanity bounds ${USD_PKR_MIN}–${USD_PKR_MAX}`);
  }
  const fx: Record<string, number> = { PKR: 1, USD: usdPkr };
  for (const code of FX_CODES) {
    if (code === 'USD') continue;
    const perUsd = rates[code];
    if (typeof perUsd !== 'number' || !Number.isFinite(perUsd) || perUsd <= 0) {
      throw new LiveFetchError('validation', `open.er-api rate for ${code} missing or invalid`);
    }
    // rates[code] = units of `code` per 1 USD, so PKR per 1 unit of code = USD/PKR ÷ that.
    fx[code] = usdPkr / perUsd;
  }
  return {
    fx,
    usdPkr,
    updatedUtc: data.time_last_update_utc || '',
    source: 'Live mid-market FX via open.er-api.com (daily update) — indicative, not the SBP official closing rate',
  };
}
