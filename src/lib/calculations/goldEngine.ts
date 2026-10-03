import { CalculatorOutput, BreakdownRow } from '../../types/calculator';
import { formatPKR } from '../utils/formatters';
import {
  GRAMS_PER_TOLA,
  MASHA_PER_TOLA,
  RATTI_PER_TOLA,
  GRAMS_PER_TROY_OUNCE,
  PURITY_FACTORS,
  DEFAULT_GOLD_24K_PER_TOLA,
  computeGoldValuation,
} from '../data/market-rates';

export interface GoldInputs {
  weight: number;
  weightUnit?: 'tola' | 'gram' | 'masha' | 'ratti' | 'ounce';
  purity?: '24k' | '22k' | '21k' | '18k';
  baseRate24kPerTola?: number; // Base rate for 24 Karat per tola (defaults to DB-verified rate)
  makingChargesPerGram?: number;
  makingChargesPercent?: number;
}

// Re-exported from the single source of truth (src/lib/data/market-rates.ts) for compatibility
export { GRAMS_PER_TOLA, MASHA_PER_TOLA, RATTI_PER_TOLA, GRAMS_PER_TROY_OUNCE, PURITY_FACTORS };

/**
 * Gold Rate & Jewelry Value Calculation Engine for Pakistan.
 *
 * NOTE: All valuation math is delegated to the canonical implementation in
 * src/lib/data/market-rates.ts (computeGoldValuation) — the same math the UI
 * gold calculator (lib/calculators/data-tools.ts) uses. This engine only maps
 * its legacy input keys and adds gold-specific extras (tola nisab / zakat check).
 * Do not re-introduce local conversion or purity math here.
 */
export function calculateGoldPrice(inputs: GoldInputs): CalculatorOutput {
  const purity = inputs.purity || '24k';

  // Canonical valuation — unit conversions, purity factors, metal value, making charges
  const v = computeGoldValuation({
    quantity: Math.max(0, inputs.weight || 0),
    unit: inputs.weightUnit || 'tola',
    purity,
    rate24kPerTola: inputs.baseRate24kPerTola,
    makingChargesPerGram: inputs.makingChargesPerGram,
    makingChargesPercent: inputs.makingChargesPercent,
  });

  const totalGrams = v.grams;
  const totalTolas = v.tolas;
  const purityFactor = v.purityFactor;
  const base24kRate = v.rate24kPerTola;
  const karatRatePerTola = base24kRate * purityFactor;
  const karatRatePerGram = (base24kRate / GRAMS_PER_TOLA) * purityFactor;
  const rawGoldValue = v.metalValue;
  const makingCharges = v.makingCharges;
  const totalJewelryPrice = Math.round(v.total);

  // 6. Zakat Nisab Check (7.5 Tola = 87.48 Grams)
  const isZakatEligible = totalTolas >= 7.5;
  const annualZakatPayable = isZakatEligible ? rawGoldValue * 0.025 : 0;

  const breakdown: BreakdownRow[] = [
    { label: `Gold Purity (${purity.toUpperCase()})`, amount: `${(purityFactor * 100).toFixed(1)}% Pure Gold`, type: 'earning' },
    { label: `Total Weight in Tolas`, amount: `${totalTolas.toFixed(3)} Tola`, type: 'earning' },
    { label: `Total Weight in Grams`, amount: `${totalGrams.toFixed(3)} Grams`, type: 'earning' },
    { label: `Current ${purity.toUpperCase()} Gold Rate / Tola`, amount: formatPKR(karatRatePerTola), type: 'earning' },
    { label: `Current ${purity.toUpperCase()} Gold Rate / Gram`, amount: formatPKR(karatRatePerGram), type: 'earning' },
    { label: `Raw Gold Metal Value`, amount: formatPKR(rawGoldValue), type: 'earning' },
    { label: `Making Charges (Karigari)`, amount: formatPKR(makingCharges), type: 'earning' },
    { label: `Total Net Jewelry Price`, amount: formatPKR(totalJewelryPrice), type: 'total' },
  ];

  return {
    primaryResult: {
      id: 'goldPrice',
      label: `Total ${purity.toUpperCase()} Gold Value`,
      value: formatPKR(totalJewelryPrice),
      subtext: `${totalTolas.toFixed(2)} Tola (${totalGrams.toFixed(2)}g) @ Rs. ${Math.round(karatRatePerTola).toLocaleString()}/Tola`,
    },
    secondaryResults: [
      { id: 'tolaWeight', label: 'Weight in Tolas', value: `${totalTolas.toFixed(3)} Tola` },
      { id: 'gramWeight', label: 'Weight in Grams', value: `${totalGrams.toFixed(2)} g` },
      { id: 'ratePerGram', label: `${purity.toUpperCase()} Rate / Gram`, value: formatPKR(karatRatePerGram) },
      { id: 'zakatAmount', label: 'Zakat Due (2.5% if ≥7.5 Tola)', value: isZakatEligible ? formatPKR(annualZakatPayable) : 'Below Nisab' },
    ],
    breakdown,
  };
}

/**
 * Async single-source default accessor for server-side callers that want the
 * live DB market rate with the verified constant as fallback.
 */
export async function getDefaultGoldRate24kPerTola(): Promise<number> {
  try {
    const { getMarketRateValue } = await import('../db/dataProvider');
    return getMarketRateValue('gold_24k_tola', DEFAULT_GOLD_24K_PER_TOLA);
  } catch {
    return DEFAULT_GOLD_24K_PER_TOLA;
  }
}
