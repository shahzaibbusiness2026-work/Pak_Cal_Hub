import { CalculatorOutput } from '../../types/calculator';
import { calculateCurrency, BASELINE_FX_RATES } from '../calculators/currency';

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

/**
 * Canonical fallback interbank rates, derived from the single FX table in
 * src/lib/calculators/currency.ts (BASELINE_FX_RATES). Kept for API compatibility.
 */
export const BASE_INTERBANK_RATES: Record<SupportedCurrency, number> = {
  USD: BASELINE_FX_RATES.USD.rateInPKR,
  AED: BASELINE_FX_RATES.AED.rateInPKR,
  SAR: BASELINE_FX_RATES.SAR.rateInPKR,
  GBP: BASELINE_FX_RATES.GBP.rateInPKR,
  EUR: BASELINE_FX_RATES.EUR.rateInPKR,
  CAD: BASELINE_FX_RATES.CAD.rateInPKR,
  AUD: BASELINE_FX_RATES.AUD.rateInPKR,
  QAR: BASELINE_FX_RATES.QAR.rateInPKR,
  KWD: BASELINE_FX_RATES.KWD.rateInPKR,
  CNY: BASELINE_FX_RATES.CNY.rateInPKR,
  JPY: BASELINE_FX_RATES.JPY.rateInPKR,
  TRY: BASELINE_FX_RATES.TRY.rateInPKR,
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
 * Currency Converter Engine for Pakistan Interbank & Open Market.
 * Delegates to the canonical UI-wired implementation in src/lib/calculators/currency.ts
 * so FX math exists in exactly one place.
 */
export function calculateCurrencyConversion(inputs: CurrencyInputs): CalculatorOutput {
  return calculateCurrency({
    amount: inputs.amount,
    fromCurrency: inputs.fromCurrency,
    toCurrency: inputs.toCurrency,
    rateType: inputs.rateType || 'interbank',
    customRate: inputs.customRate,
  });
}
