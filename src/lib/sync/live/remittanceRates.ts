import { REMITTANCE_CURRENCY_CODES } from '../../data/remittance';
import { fetchLiveFx, LiveFxResult } from './fxLive';

export interface RemittanceReference {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  asOf: string | null;
  source: string;
}

/** Share one upstream snapshot across currency pairs for an hour. */
export function createRemittanceReferenceService(loader: () => Promise<LiveFxResult> = fetchLiveFx, now: () => number = Date.now) {
  let cached: { snapshot: LiveFxResult; expires: number } | undefined;
  let pending: Promise<LiveFxResult> | undefined;
  const snapshot = () => {
    if (cached && cached.expires > now() && now() - Date.parse(cached.snapshot.updatedUtc) <= 3 * 86400000) return Promise.resolve(cached.snapshot);
    if (!pending) pending = loader().then((value) => {
      cached = { snapshot: value, expires: now() + 3600000 };
      return value;
    }).finally(() => { pending = undefined; });
    return pending;
  };
  return async (from: string, to: string): Promise<RemittanceReference> => {
    if (!REMITTANCE_CURRENCY_CODES.has(from) || !REMITTANCE_CURRENCY_CODES.has(to)) throw new RangeError('Choose supported currency codes.');
    if (from === to) return { fromCurrency: from, toCurrency: to, rate: 1, asOf: null, source: 'Same-currency transfer' };
    const value = await snapshot();
    const fromRate = value.fx[from];
    const toRate = value.fx[to];
    const rate = fromRate / toRate;
    if (!(fromRate > 0) || !(toRate > 0) || !Number.isFinite(rate) || rate <= 0) throw new Error('This currency pair is unavailable from the reference source. Enter a provider quote.');
    return { fromCurrency: from, toCurrency: to, rate, asOf: value.updatedUtc, source: 'Daily indicative reference — rates by ExchangeRate-API' };
  };
}

export const getRemittanceReference = createRemittanceReferenceService();
