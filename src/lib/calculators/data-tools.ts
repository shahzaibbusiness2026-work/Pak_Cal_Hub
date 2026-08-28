import { formatPKR, safeNumber, formatNumber } from '../utils/formatters';
import { CalculatorOutput, BreakdownRow } from '../../types/calculator';

/**
 * Pakistani Gold & Silver Price Calculator (24K, 22K, 21K, 18K per Tola, 10 Grams, Grams, Ratti, Masha)
 */
export function calculateGoldPrice(inputs: Record<string, any>): CalculatorOutput {
  const goldRate24kPerTola = safeNumber(inputs.goldRate24kPerTola, 475000); // 24K per Tola in PKR (August 2026 Sarafa benchmark)
  const quantity = safeNumber(inputs.quantity, 1);
  const unit = inputs.unit || 'tola'; // tola, gram, 10gram, masha, ratti
  const purity = inputs.purity || '24k'; // 24k, 22k, 21k, 18k
  const makingChargesPerGram = safeNumber(inputs.makingChargesPerGram, 2500); // Jeweler making charges

  // 1 Tola = 11.664 Grams = 12 Masha = 96 Ratti
  const TOLA_IN_GRAMS = 11.664;
  let totalGrams = 0;

  switch (unit) {
    case 'tola':
      totalGrams = quantity * TOLA_IN_GRAMS;
      break;
    case '10gram':
      totalGrams = quantity * 10;
      break;
    case 'gram':
      totalGrams = quantity;
      break;
    case 'masha':
      totalGrams = (quantity / 12) * TOLA_IN_GRAMS;
      break;
    case 'ratti':
      totalGrams = (quantity / 96) * TOLA_IN_GRAMS;
      break;
    default:
      totalGrams = quantity * TOLA_IN_GRAMS;
  }

  // Purity factors
  let purityFactor = 1.0;
  if (purity === '22k') purityFactor = 22 / 24; // 91.6%
  if (purity === '21k') purityFactor = 21 / 24; // 87.5%
  if (purity === '18k') purityFactor = 18 / 24; // 75.0%

  const pureGoldPricePerGram = goldRate24kPerTola / TOLA_IN_GRAMS;
  const itemGoldCost = totalGrams * pureGoldPricePerGram * purityFactor;
  const totalMakingCharges = totalGrams * makingChargesPerGram;
  const grandTotal = itemGoldCost + totalMakingCharges;

  const tolasEquivalent = totalGrams / TOLA_IN_GRAMS;

  return {
    primaryResult: {
      id: 'goldTotal',
      label: 'Estimated Gold Value',
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
      { id: 'rate10g', label: 'Rate per 10 Grams', value: formatPKR(pureGoldPricePerGram * 10 * purityFactor), type: 'currency' },
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
      'Gold rates in Pakistan Sarafa Bazars are traded on 1 Tola = 11.664 Grams standard.',
      'Jewelry is predominantly crafted in 22K (916 purity) or 21K/18K for diamond studded settings.',
    ],
  };
}
