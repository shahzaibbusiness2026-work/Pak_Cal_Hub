import { formatPKR, safeNumber, formatNumber } from '../utils/formatters';
import { CalculatorOutput, BreakdownRow } from '../../types/calculator';
import {
  GRAMS_PER_TOLA,
  DEFAULT_GOLD_24K_PER_TOLA,
  DEFAULT_MAKING_CHARGES_PER_GRAM,
  computeGoldValuation,
} from '../data/market-rates';

/**
 * Pakistani Gold & Silver Price Calculator (24K, 22K, 21K, 18K per Tola, 10 Grams, Grams, Ratti, Masha)
 * CANONICAL gold implementation — the UI path. The legacy calculations/goldEngine
 * delegates its math to the same shared computeGoldValuation().
 */
export function calculateGoldPrice(inputs: Record<string, any>): CalculatorOutput {
  const goldRate24kPerTola = safeNumber(inputs.goldRate24kPerTola, DEFAULT_GOLD_24K_PER_TOLA);
  const quantity = safeNumber(inputs.quantity, 1);
  const unit = inputs.unit || 'tola'; // tola, gram, 10gram, masha, ratti
  const purity = inputs.purity || '24k'; // 24k, 22k, 21k, 18k
  const makingChargesPerGram = safeNumber(inputs.makingChargesPerGram, DEFAULT_MAKING_CHARGES_PER_GRAM);
  // Optional percent-based making charges (used by the legacy engine delegation path)
  const makingChargesPercent = safeNumber(inputs.makingChargesPercent, 0);

  // Single canonical valuation — unit conversions, purity factors, metal value (see market-rates.ts)
  const v = computeGoldValuation({
    quantity,
    unit,
    purity,
    rate24kPerTola: goldRate24kPerTola,
    makingChargesPerGram,
    makingChargesPercent,
  });

  const totalGrams = v.grams;
  const purityFactor = v.purityFactor;
  const pureGoldPricePerGram = goldRate24kPerTola / GRAMS_PER_TOLA;
  const itemGoldCost = v.metalValue;
  const totalMakingCharges = v.makingCharges;
  const grandTotal = v.total;
  const tolasEquivalent = v.tolas;

  return {
    primaryResult: {
      id: 'goldTotal',
      label: 'Estimated Gold Value (incl. Making)',
      value: formatPKR(grandTotal),
      type: 'currency',
      highlight: true,
      color: 'success',
      subtext: `${purity.toUpperCase()} Gold (${totalGrams.toFixed(2)} Grams / ${tolasEquivalent.toFixed(3)} Tola)`,
    },
    secondaryResults: [
      { id: 'goldCost', label: 'Pure Gold Value', value: formatPKR(itemGoldCost), type: 'currency' },
      { id: 'making', label: 'Jeweler Making Charges', value: formatPKR(totalMakingCharges), type: 'currency' },
      { id: 'ratePerGram', label: 'Rate per Gram (24K)', value: formatPKR(pureGoldPricePerGram), type: 'currency' },
      { id: 'rate10g', label: 'Rate per 10 Grams (24K)', value: formatPKR(pureGoldPricePerGram * 10), type: 'currency' },
    ],
    breakdown: [
      { label: `Base 24K Gold Rate per Tola`, amount: formatPKR(goldRate24kPerTola) },
      { label: `Gold Purity Selected`, detail: `${purity.toUpperCase()} (${(purityFactor * 100).toFixed(1)}% pure gold)`, amount: `${(purityFactor * 100).toFixed(1)}%` },
      { label: `Total Weight in Grams`, amount: `${totalGrams.toFixed(3)} Grams` },
      { label: `Total Weight in Tolas`, amount: `${tolasEquivalent.toFixed(3)} Tola` },
      { label: `Net Gold Metal Cost`, amount: formatPKR(itemGoldCost) },
      { label: `Making Charges (Wastage / Labour)`, amount: formatPKR(totalMakingCharges) },
      { label: `Total Estimated Jeweler Purchase Price`, amount: formatPKR(grandTotal), isTotal: true },
    ],
    notes: [
      'Gold rates in Pakistan Sarafa Bazars are traded on 1 Tola = 11.6638 Grams standard.',
      'Jewelry is predominantly crafted in 22K (916 purity) or 21K/18K for diamond studded settings.',
    ],
  };
}
