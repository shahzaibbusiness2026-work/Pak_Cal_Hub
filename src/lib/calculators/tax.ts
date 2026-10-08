import { calculateTax } from '../calculations/taxEngine';
import { formatPKR, safeNumber } from '../utils/formatters';
import { CalculatorOutput } from '../../types/calculator';
import { getTaxDataset } from '../../data/tax';
import { TaxYear } from '../../types/government';

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
  const isPseb = inputs.isPsebRegistered !== false;
  return calculateTax({
    taxYear: inputs.taxYear || '2026-27',
    incomeType: 'freelancer',
    incomePeriod: inputs.period || 'annual',
    income: inputs.annualIncome || inputs.foreignIncome || inputs.income,
    isPsebRegistered: isPseb,
    remittanceChannel: inputs.remittanceChannel,
  });
}

/**
 * Property Advance Tax & Transfer Fee Calculator (Sections 236C & 236K)
 */
export function calculatePropertyTax(inputs: Record<string, any>): CalculatorOutput {
  const propertyValue = safeNumber(inputs.propertyValue, 18000000); // Rs 1.8 Crore
  const isFiler = inputs.isFiler !== false;
  const isBuying = inputs.transactionType === 'buy';
  const taxYear = (inputs.taxYear as TaxYear) || '2026-27';

  // Rates come from the selected tax year's dataset (Sections 236C & 236K)
  const dataset = getTaxDataset(taxYear);
  const pt = dataset.propertyTax;
  const nonFilerBuyerRate = taxYear === '2026-27' ? (propertyValue <= 50000000 ? 0.105 : propertyValue <= 100000000 ? 0.145 : 0.185) : pt.buyerNonFilerRate;

  let advanceTaxRate = 0;
  if (isBuying) {
    advanceTaxRate = isFiler ? pt.buyerFilerRate : nonFilerBuyerRate; // Section 236K (TY2027 non-filer is value-banded)
  } else {
    advanceTaxRate = isFiler ? pt.sellerFilerRate : pt.sellerNonFilerRate; // Section 236C
  }

  const advanceTax = propertyValue * advanceTaxRate;
  // VERIFY: provincial stamp duty and local TMA/transfer fees vary by province and transaction year — these are estimates.
  const stampDutyRate = 0.01; // 1%
  const stampDuty = propertyValue * stampDutyRate;
  const tmaFee = propertyValue * 0.01; // 1% Local TMA/Corporation fee (estimate — verify locally)

  const totalGovtCharges = advanceTax + stampDuty + tmaFee;

  return {
    primaryResult: {
      id: 'totalTax',
      label: 'Estimated Government Taxes & Fees (advance tax + estimated local fees)',
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
      { label: 'Estimated Total Transfer Charges (excludes seller capital-gains tax under Section 37)', amount: formatPKR(totalGovtCharges), isTotal: true },
    ],
    notes: [
      `Advance tax rates read from the ${dataset.assessmentYear} dataset: Section 236K (Buyer) ${(pt.buyerFilerRate * 100).toFixed(2)}% filer / ${(pt.buyerNonFilerRate * 100).toFixed(2)}% non-filer; Section 236C (Seller) ${(pt.sellerFilerRate * 100).toFixed(2)}% filer / ${(pt.sellerNonFilerRate * 100).toFixed(2)}% non-filer.`,
      'Stamp duty (1%) and TMA / transfer fee (1%) are estimates — verify against your provincial Excise & Taxation / LDA / development-authority schedule before paying.',
      'This tool covers advance withholding tax (236C/236K) plus estimated local charges only. A seller\'s capital-gains tax under Section 37 is separate and is not included; late-filer rates are not yet published in the repo\'s verified TY2027 source, so this tool offers filer and non-filer only.',
    ],
  };
}
