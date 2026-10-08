import { formatPKR, formatPercent, safeNumber, formatNumber } from '../utils/formatters';
import { CalculatorOutput, BreakdownRow } from '../../types/calculator';

// Canonical fallback FX table for PKR (indicative SBP Interbank Closing rates).
// Source of truth for fallback values: repo's verified sync feed (src/lib/sync/currency.ts,
// SBP Interbank Closing). CAD 204.50 matches the feed; AUD / QAR / KWD are indicative
// interbank fallbacks. Live rates come from SBP / Forex.pk — these are fallbacks only.
export const BASELINE_FX_RATES: Record<string, { name: string; rateInPKR: number; symbol: string }> = {
  USD: { name: 'US Dollar',            rateInPKR: 277.10, symbol: '$' },
  GBP: { name: 'British Pound',        rateInPKR: 357.00, symbol: '£' },
  EUR: { name: 'Euro',                 rateInPKR: 302.80, symbol: '€' },
  AED: { name: 'UAE Dirham',           rateInPKR: 76.40,  symbol: 'AED' },
  SAR: { name: 'Saudi Riyal',          rateInPKR: 74.80,  symbol: 'SAR' },
  CAD: { name: 'Canadian Dollar',      rateInPKR: 204.50, symbol: 'C$' },
  AUD: { name: 'Australian Dollar',    rateInPKR: 182.20, symbol: 'A$' },
  CNY: { name: 'Chinese Yuan',         rateInPKR: 38.60,  symbol: '¥' },
  QAR: { name: 'Qatari Riyal',         rateInPKR: 76.90,  symbol: 'QAR' },
  KWD: { name: 'Kuwaiti Dinar',        rateInPKR: 914.50, symbol: 'KWD' },
  JPY: { name: 'Japanese Yen',         rateInPKR: 1.88,   symbol: '¥' },
  TRY: { name: 'Turkish Lira',         rateInPKR: 8.20,   symbol: '₺' },
};

/**
 * Currency Converter to/from Pakistani Rupee (PKR)
 * Canonical FX implementation (UI-wired). Supports Interbank vs Open Market regimes.
 */
export function calculateCurrency(inputs: Record<string, any>): CalculatorOutput {
  const amount = safeNumber(inputs.amount, 100);
  const fromCurrency = inputs.fromCurrency || 'USD';
  const toCurrency = inputs.toCurrency || 'PKR';
  const customRate = safeNumber(inputs.customRate, 0);
  const rateType = inputs.rateType === 'openMarket' ? 'openMarket' : 'interbank';
  // Open-market retail quotes carry a spread over interbank (indicative ~0.75%)
  const spreadFactor = rateType === 'openMarket' ? 1.0075 : 1.0;

  const rateInPkr = (cur: string): number => {
    if (cur === 'PKR') return 1;
    const fx = BASELINE_FX_RATES[cur] || BASELINE_FX_RATES['USD'];
    return fx.rateInPKR * spreadFactor;
  };

  let effectiveRate = 1;
  let resultAmount = 0;

  if (fromCurrency === 'PKR' && toCurrency !== 'PKR') {
    effectiveRate = customRate > 0 ? (1 / customRate) : (1 / rateInPkr(toCurrency));
    resultAmount = amount * effectiveRate;
  } else if (fromCurrency !== 'PKR' && toCurrency === 'PKR') {
    effectiveRate = customRate > 0 ? customRate : rateInPkr(fromCurrency);
    resultAmount = amount * effectiveRate;
  } else if (fromCurrency === toCurrency) {
    effectiveRate = 1;
    resultAmount = amount;
  } else {
    // Cross currency via PKR
    effectiveRate = rateInPkr(fromCurrency) / rateInPkr(toCurrency);
    resultAmount = amount * effectiveRate;
  }

  const isTargetPKR = toCurrency === 'PKR';
  const formattedResult = isTargetPKR
    ? formatPKR(resultAmount)
    : `${toCurrency} ${formatNumber(resultAmount, 2)}`;
  const regimeLabel = rateType === 'openMarket' ? 'Open Market (Retail)' : 'SBP Interbank (Closing)';

  return {
    primaryResult: {
      id: 'convertedAmount',
      label: `Converted Amount (${toCurrency})`,
      value: formattedResult,
      type: isTargetPKR ? 'currency' : 'text',
      highlight: true,
      color: 'success',
      subtext: `1 ${fromCurrency} = ${formatNumber(effectiveRate, 4)} ${toCurrency} (${regimeLabel})`,
    },
    secondaryResults: [
      { id: 'rate', label: 'Exchange Rate', value: `${formatNumber(effectiveRate, 4)}`, type: 'text' },
      { id: 'source', label: 'Input Amount', value: `${fromCurrency} ${formatNumber(amount, 2)}`, type: 'text' },
    ],
    breakdown: [
      { label: `Base Amount (${fromCurrency})`, amount: `${fromCurrency} ${formatNumber(amount, 2)}` },
      { label: `Market Regime`, amount: regimeLabel },
      { label: `Applicable Exchange Rate`, amount: `1 ${fromCurrency} = ${effectiveRate.toFixed(4)} ${toCurrency}` },
      { label: `Final Value in ${toCurrency}`, amount: formattedResult, isTotal: true },
    ],
    notes: [
      `${regimeLabel} parity rate. Open-market quotes carry an indicative ~0.75% retail spread over interbank.`,
      'Fallback USD rate is the verified SBP M2M rate of Rs 277.10 (1 Oct 2026, verified 4 Oct 2026); other fallbacks are indicative SBP Interbank Closing values. Check SBP for live rates.',
    ],
  };
}
