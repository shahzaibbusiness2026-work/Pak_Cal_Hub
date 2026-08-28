import { CalculatorOutput, BreakdownRow } from '../../types/calculator';
import { formatPKR } from '../utils/formatters';

export type SupportedCurrency =
  | 'USD'
  | 'AED'
  | 'SAR'
  | 'GBP'
  | 'EUR'
  | 'CAD'
  | 'AUD'
  | 'QAR'
  | 'KWD'
  | 'CNY'
  | 'JPY'
  | 'TRY';

export interface CurrencyInputs {
  amount: number;
  fromCurrency: SupportedCurrency | 'PKR';
  toCurrency: SupportedCurrency | 'PKR';
  rateType?: 'interbank' | 'openMarket';
  customRate?: number;
}

export const BASE_INTERBANK_RATES: Record<SupportedCurrency, number> = {
  USD: 280.50,
  AED: 76.40,
  SAR: 74.80,
  GBP: 357.00,
  EUR: 302.80,
  CAD: 204.50,
  AUD: 182.20,
  QAR: 76.90,
  KWD: 914.50,
  CNY: 38.60,
  JPY: 1.88,
  TRY: 8.20,
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  AED: 'AED',
  SAR: 'SAR',
  GBP: '£',
  EUR: '€',
  CAD: 'CA$',
  AUD: 'AU$',
  QAR: 'QAR',
  KWD: 'KWD',
  CNY: '¥',
  JPY: '¥',
  TRY: '₺',
  PKR: 'Rs.',
};

/**
 * Pure Currency Converter Engine for Pakistan Interbank & Open Market
 */
export function calculateCurrencyConversion(inputs: CurrencyInputs): CalculatorOutput {
  const amount = Math.max(0, inputs.amount || 0);
  const from = inputs.fromCurrency || 'USD';
  const to = inputs.toCurrency || 'PKR';
  const rateType = inputs.rateType || 'interbank';
  const spreadFactor = rateType === 'openMarket' ? 1.0075 : 1.0; // 0.75% Open Market spread

  // Determine exchange rate relative to 1 PKR
  const getRateToPkr = (cur: string): number => {
    if (cur === 'PKR') return 1;
    const base = BASE_INTERBANK_RATES[cur as SupportedCurrency] || 280.50;
    return base * spreadFactor;
  };

  const fromRateInPkr = inputs.customRate && inputs.customRate > 0 && to === 'PKR'
    ? inputs.customRate
    : getRateToPkr(from);

  const toRateInPkr = getRateToPkr(to);

  // Conversion formula: Amount in From -> PKR -> To
  const amountInPkr = amount * fromRateInPkr;
  const convertedAmount = amountInPkr / toRateInPkr;
  const effectiveDirectRate = fromRateInPkr / toRateInPkr;

  const fromSymbol = CURRENCY_SYMBOLS[from] || from;
  const toSymbol = CURRENCY_SYMBOLS[to] || to;

  const breakdown: BreakdownRow[] = [
    { label: `Source Amount (${from})`, amount: `${fromSymbol} ${amount.toLocaleString()}`, type: 'earning' },
    { label: `Market Regime`, amount: rateType === 'openMarket' ? 'Open Market (Retail)' : 'State Bank Interbank (Closing)', type: 'earning' },
    { label: `Exchange Rate (1 ${from})`, amount: `${toSymbol} ${effectiveDirectRate.toFixed(4)} ${to}`, type: 'earning' },
    { label: `Equivalent in PKR`, amount: formatPKR(amountInPkr), type: 'earning' },
    { label: `Final Converted Value`, amount: `${toSymbol} ${convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, type: 'total' },
  ];

  const formattedPrimary = to === 'PKR'
    ? formatPKR(convertedAmount)
    : `${toSymbol} ${convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return {
    primaryResult: {
      id: 'convertedAmount',
      label: `Converted Amount in ${to}`,
      value: formattedPrimary,
      subtext: `1 ${from} = ${effectiveDirectRate.toFixed(2)} ${to} (${rateType === 'openMarket' ? 'Open Market' : 'Interbank'})`,
    },
    secondaryResults: [
      { id: 'directRate', label: `1 ${from} Rate`, value: `${toSymbol} ${effectiveDirectRate.toFixed(2)}` },
      { id: 'inverseRate', label: `1 ${to} Rate`, value: `${fromSymbol} ${(1 / effectiveDirectRate).toFixed(4)}` },
      { id: 'pkrTotal', label: 'Equivalent PKR', value: formatPKR(amountInPkr) },
    ],
    breakdown,
  };
}
