import { calculateTax } from '../calculations/taxEngine';
import { formatPKR, safeNumber } from '../utils/formatters';
import { CalculatorOutput } from '../../types/calculator';

/**
 * Calculates FBR Pakistan Income Tax for Salaried & Non-Salaried Individuals
 * Delegates to the pure taxEngine
 */
export function calculateIncomeTax(inputs: Record<string, any>): CalculatorOutput {
  const isSalaried = inputs.taxpayerType !== 'non-salaried';
  return calculateTax({
    taxYear: inputs.taxYear || '2026-27',
    incomeType: isSalaried ? 'salaried' : 'business',
    incomePeriod: inputs.period || 'monthly',
    income: inputs.income,
    isSenior: inputs.isSenior,
  });
}

/**
 * Freelancer / IT Exporter Tax under Section 154A
 * Delegates to pure taxEngine
 */
export function calculateFreelancerTax(inputs: Record<string, any>): CalculatorOutput {
  const isPseb = inputs.isRegistered !== false;
  return calculateTax({
    taxYear: inputs.taxYear || '2026-27',
    incomeType: 'freelancer',
    incomePeriod: inputs.period || 'monthly',
    income: inputs.foreignIncome || inputs.income,
    isPsebRegistered: isPseb,
  });
}

/**
 * Property Advance Tax & Transfer Fee Calculator (Sections 236C & 236K)
 */
export function calculatePropertyTax(inputs: Record<string, any>): CalculatorOutput {
  const propertyValue = safeNumber(inputs.propertyValue, 18000000); // Rs 1.8 Crore
  const isFiler = inputs.isFiler !== false;
  const isBuying = inputs.transactionType === 'buy';

  let advanceTaxRate = 0;
  if (isBuying) {
    advanceTaxRate = isFiler ? 0.015 : 0.105; // 1.5% filer vs 10.5% non-filer
  } else {
    advanceTaxRate = isFiler ? 0.0275 : 0.10; // 2.75% filer vs 10% non-filer
  }

  const advanceTax = propertyValue * advanceTaxRate;
  const stampDutyRate = 0.01; // 1%
  const stampDuty = propertyValue * stampDutyRate;
  const tmaFee = propertyValue * 0.01; // 1% Local TMA/Corporation fee

  const totalGovtCharges = advanceTax + stampDuty + tmaFee;

  return {
    primaryResult: {
      id: 'totalTax',
      label: 'Total Government Taxes & Fees',
      value: formatPKR(totalGovtCharges),
      type: 'currency',
      highlight: true,
      color: 'warning',
      subtext: `${isBuying ? 'Buyer Section 236K' : 'Seller Section 236C'} (${(advanceTaxRate * 100).toFixed(2)}%)`,
    },
    secondaryResults: [
      { id: 'advanceTax', label: `FBR Advance Tax (${(advanceTaxRate * 100).toFixed(2)}%)`, value: formatPKR(advanceTax), type: 'currency' },
      { id: 'stampDuty', label: 'Provincial Stamp Duty (1%)', value: formatPKR(stampDuty), type: 'currency' },
      { id: 'tmaFee', label: 'TMA / Transfer Duty (1%)', value: formatPKR(tmaFee), type: 'currency' },
      { id: 'filerStatus', label: 'Taxpayer Status', value: isFiler ? 'Active Filer' : 'Non-Filer', type: 'badge' },
    ],
    breakdown: [
      { label: 'Property Valuation (FBR/DC Rate)', amount: formatPKR(propertyValue) },
      { label: `FBR Advance Tax (${isBuying ? 'Section 236K Purchase' : 'Section 236C Sale'})`, detail: `${(advanceTaxRate * 100).toFixed(2)}% for ${isFiler ? 'Filer' : 'Non-Filer'}`, amount: formatPKR(advanceTax) },
      { label: 'Provincial Stamp Duty (e-Stamping 1%)', amount: formatPKR(stampDuty) },
      { label: 'Local Government / TMA Transfer Fee (1%)', amount: formatPKR(tmaFee) },
      { label: 'Total Government Transfer Charges', amount: formatPKR(totalGovtCharges), isTotal: true },
    ],
    notes: [
      'Under Finance Act 2026 salient features, Section 236K (Buyer) is flat 1.5% and Section 236C (Seller) is flat 2.75% for active filers.',
      'Non-filers face punitive rates of 10.5% (Buyer) and 10% (Seller).',
    ],
  };
}
