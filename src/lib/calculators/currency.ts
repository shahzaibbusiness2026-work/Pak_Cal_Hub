import { formatPKR, formatPercent, safeNumber, formatNumber } from '../utils/formatters';
import { CalculatorOutput, BreakdownRow } from '../../types/calculator';

// Current Indicative Open Market / SBP Interbank Reference Rates for PKR (August 2026)
// IMPORTANT: Rates updated as of 28 August 2026. For live rates use SBP or Forex.pk
export const BASELINE_FX_RATES: Record<string, { name: string; rateInPKR: number; symbol: string }> = {
  USD: { name: 'US Dollar',            rateInPKR: 280.50, symbol: '$' },
  GBP: { name: 'British Pound',        rateInPKR: 357.00, symbol: '£' },
  EUR: { name: 'Euro',                 rateInPKR: 302.80, symbol: '€' },
  AED: { name: 'UAE Dirham',           rateInPKR: 76.40,  symbol: 'AED' },
  SAR: { name: 'Saudi Riyal',          rateInPKR: 74.80,  symbol: 'SAR' },
  CAD: { name: 'Canadian Dollar',      rateInPKR: 207.50, symbol: 'C$' },
  AUD: { name: 'Australian Dollar',    rateInPKR: 186.40, symbol: 'A$' },
  CNY: { name: 'Chinese Yuan',         rateInPKR: 38.60,  symbol: '¥' },
  QAR: { name: 'Qatari Riyal',         rateInPKR: 77.05,  symbol: 'QAR' },
  KWD: { name: 'Kuwaiti Dinar',        rateInPKR: 915.00, symbol: 'KWD' },
};

/**
 * Currency Converter to/from Pakistani Rupee (PKR)
 */
export function calculateCurrency(inputs: Record<string, any>): CalculatorOutput {
  const amount = safeNumber(inputs.amount, 100);
  const fromCurrency = inputs.fromCurrency || 'USD';
  const toCurrency = inputs.toCurrency || 'PKR';
  const customRate = safeNumber(inputs.customRate, 0);

  let effectiveRate = 1;
  let resultAmount = 0;

  if (fromCurrency === 'PKR' && toCurrency !== 'PKR') {
    const targetFx = BASELINE_FX_RATES[toCurrency] || BASELINE_FX_RATES['USD'];
    effectiveRate = customRate > 0 ? (1 / customRate) : (1 / targetFx.rateInPKR);
    resultAmount = amount * effectiveRate;
  } else if (fromCurrency !== 'PKR' && toCurrency === 'PKR') {
    const sourceFx = BASELINE_FX_RATES[fromCurrency] || BASELINE_FX_RATES['USD'];
    effectiveRate = customRate > 0 ? customRate : sourceFx.rateInPKR;
    resultAmount = amount * effectiveRate;
  } else if (fromCurrency === toCurrency) {
    effectiveRate = 1;
    resultAmount = amount;
  } else {
    // Cross currency via PKR
    const sourceFx = BASELINE_FX_RATES[fromCurrency]?.rateInPKR || 1;
    const targetFx = BASELINE_FX_RATES[toCurrency]?.rateInPKR || 1;
    effectiveRate = sourceFx / targetFx;
    resultAmount = amount * effectiveRate;
  }

  const isTargetPKR = toCurrency === 'PKR';
  const formattedResult = isTargetPKR
    ? formatPKR(resultAmount)
    : `${toCurrency} ${formatNumber(resultAmount, 2)}`;

  return {
    primaryResult: {
      id: 'convertedAmount',
      label: `Converted Amount (${toCurrency})`,
      value: formattedResult,
      type: isTargetPKR ? 'currency' : 'text',
      highlight: true,
      color: 'success',
      subtext: `1 ${fromCurrency} = ${formatNumber(effectiveRate, 4)} ${toCurrency}`,
    },
    secondaryResults: [
      { id: 'rate', label: 'Exchange Rate', value: `${formatNumber(effectiveRate, 4)}`, type: 'text' },
      { id: 'source', label: 'Input Amount', value: `${fromCurrency} ${formatNumber(amount, 2)}`, type: 'text' },
    ],
    breakdown: [
      { label: `Base Amount (${fromCurrency})`, amount: `${fromCurrency} ${formatNumber(amount, 2)}` },
      { label: `Applicable Exchange Rate`, amount: `1 ${fromCurrency} = ${effectiveRate.toFixed(4)} ${toCurrency}` },
      { label: `Final Value in ${toCurrency}`, amount: formattedResult, isTotal: true },
    ],
    notes: [
      'Indicative Open Market / Interbank parity rate in Pakistan.',
    ],
  };
}
