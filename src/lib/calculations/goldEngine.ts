import { CalculatorOutput, BreakdownRow } from '../../types/calculator';
import { formatPKR } from '../utils/formatters';

export interface GoldInputs {
  weight: number;
  weightUnit?: 'tola' | 'gram' | 'masha' | 'ratti' | 'ounce';
  purity?: '24k' | '22k' | '21k' | '18k';
  baseRate24kPerTola?: number; // Base rate for 24 Karat per tola (default 242,000)
  makingChargesPerGram?: number;
  makingChargesPercent?: number;
}

export const GRAMS_PER_TOLA = 11.6638;
export const MASHA_PER_TOLA = 12;
export const RATTI_PER_TOLA = 96;
export const GRAMS_PER_TROY_OUNCE = 31.1035;

export const PURITY_FACTORS = {
  '24k': 1.0,
  '22k': 22 / 24, // 0.9167
  '21k': 21 / 24, // 0.8750
  '18k': 18 / 24, // 0.7500
};

/**
 * Pure Gold Rate & Jewelry Value Calculation Engine for Pakistan
 */
export function calculateGoldPrice(inputs: GoldInputs): CalculatorOutput {
  const rawWeight = Math.max(0, inputs.weight || 0);
  const unit = inputs.weightUnit || 'tola';
  const purity = inputs.purity || '24k';
  const base24kRate = inputs.baseRate24kPerTola && inputs.baseRate24kPerTola > 0
    ? inputs.baseRate24kPerTola
    : 242000;

  // 1. Convert all units to Grams & Tolas
  let totalGrams = 0;
  if (unit === 'tola') totalGrams = rawWeight * GRAMS_PER_TOLA;
  else if (unit === 'gram') totalGrams = rawWeight;
  else if (unit === 'masha') totalGrams = (rawWeight / MASHA_PER_TOLA) * GRAMS_PER_TOLA;
  else if (unit === 'ratti') totalGrams = (rawWeight / RATTI_PER_TOLA) * GRAMS_PER_TOLA;
  else if (unit === 'ounce') totalGrams = rawWeight * GRAMS_PER_TROY_OUNCE;

  const totalTolas = totalGrams / GRAMS_PER_TOLA;
  const purityFactor = PURITY_FACTORS[purity];

  // 2. Compute 24K and Karat-adjusted rates
  const rate24kPerGram = base24kRate / GRAMS_PER_TOLA;
  const karatRatePerTola = base24kRate * purityFactor;
  const karatRatePerGram = rate24kPerGram * purityFactor;

  // 3. Raw Gold Metal Value
  const rawGoldValue = totalGrams * karatRatePerGram;

  // 4. Making Charges (Wastage / Karigari)
  let makingCharges = 0;
  if (inputs.makingChargesPerGram && inputs.makingChargesPerGram > 0) {
    makingCharges = totalGrams * inputs.makingChargesPerGram;
  } else if (inputs.makingChargesPercent && inputs.makingChargesPercent > 0) {
    makingCharges = rawGoldValue * (inputs.makingChargesPercent / 100);
  }

  // 5. Total Jewelry Price
  const totalJewelryPrice = Math.round(rawGoldValue + makingCharges);

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
