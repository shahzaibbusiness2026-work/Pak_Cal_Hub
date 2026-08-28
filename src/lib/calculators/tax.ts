import { SALARIED_TAX_SLABS, NON_SALARIED_TAX_SLABS, NON_SALARIED_SURCHARGE_THRESHOLD, NON_SALARIED_SURCHARGE_RATE } from '../data/tax-slabs-data';
import { formatPKR, formatPercent, safeNumber } from '../utils/formatters';
import { CalculatorOutput, BreakdownRow, ChartDataPoint } from '../../types/calculator';

/**
 * Calculates FBR Pakistan Income Tax for Salaried & Non-Salaried Individuals
 * Tax Year 2027 (FY 2026-27) — Finance Act 2026
 */
export function calculateIncomeTax(inputs: Record<string, any>): CalculatorOutput {
  const isMonthly = inputs.period === 'monthly';
  const rawIncome = safeNumber(inputs.income, 180000);
  const annualIncome = isMonthly ? rawIncome * 12 : rawIncome;
  const isSalaried = inputs.taxpayerType !== 'non-salaried';

  const slabs = isSalaried ? SALARIED_TAX_SLABS : NON_SALARIED_TAX_SLABS;

  let baseTax = 0;
  let variableTax = 0;
  let totalAnnualTax = 0;
  let activeSlab = slabs[0];
  let marginalRate = 0;

  // Fixed: single-pass loop — handles all slabs including the last (max: Infinity) correctly
  for (const slab of slabs) {
    if (annualIncome > slab.min) {
      activeSlab = slab;
      marginalRate = slab.rate * 100;
      if (annualIncome <= slab.max) {
        // Income falls within this slab
        baseTax = slab.baseTax;
        variableTax = (annualIncome - slab.min) * slab.rate;
        totalAnnualTax = baseTax + variableTax;
        break; // Found the correct slab — no further iteration needed
      }
      // For max: Infinity slabs this condition is never true so loop continues
      // to the last slab naturally without a separate fallback block
    }
  }

  // Handle edge case: income exactly = 0 or below the first slab minimum
  if (annualIncome <= slabs[0].max) {
    totalAnnualTax = 0;
    activeSlab = slabs[0];
    marginalRate = 0;
  }

  // Surcharge: Abolished for salaried individuals in Finance Act 2026; applies only to Non-Salaried > Rs 10M
  let surcharge = 0;
  if (!isSalaried && annualIncome > NON_SALARIED_SURCHARGE_THRESHOLD) {
    surcharge = totalAnnualTax * NON_SALARIED_SURCHARGE_RATE;
    totalAnnualTax += surcharge;
  }

  const monthlyTax = totalAnnualTax / 12;
  const monthlyTakeHome = (annualIncome - totalAnnualTax) / 12;
  const annualTakeHome = annualIncome - totalAnnualTax;
  const effectiveRate = annualIncome > 0 ? (totalAnnualTax / annualIncome) * 100 : 0;

  const breakdown: BreakdownRow[] = [
    { label: 'Gross Annual Taxable Income', amount: formatPKR(annualIncome) },
    { label: 'Applicable FBR Slab (FY 2026-27)', detail: activeSlab.description, amount: `${marginalRate.toFixed(0)}% Marginal Rate` },
    { label: 'Base Fixed Tax of Slab', amount: formatPKR(baseTax) },
    { label: `Variable Tax on Excess above ${formatPKR(activeSlab.min)}`, amount: formatPKR(variableTax) },
  ];

  if (surcharge > 0) {
    breakdown.push({ label: 'Non-Salaried Surcharge (10% on tax for income > Rs. 10M)', amount: formatPKR(surcharge) });
  }

  breakdown.push(
    { label: 'Total Annual Income Tax', amount: formatPKR(totalAnnualTax), isTotal: true },
    { label: 'Monthly Tax Deduction at Source (TDS)', amount: formatPKR(monthlyTax), isTotal: true }
  );

  const chartData: ChartDataPoint[] = [
    { name: 'Take-Home Income', value: Math.round(annualTakeHome), color: '#16a34a' },
    { name: 'Income Tax (FBR)', value: Math.round(totalAnnualTax), color: '#ef4444' },
  ];

  return {
    primaryResult: {
      id: 'monthlyTax',
      label: 'Monthly Tax Deduction (TDS)',
      value: formatPKR(monthlyTax),
      type: 'currency',
      highlight: true,
      subtext: `Effective: ${effectiveRate.toFixed(2)}% | Marginal: ${marginalRate.toFixed(0)}%`,
      color: totalAnnualTax > 0 ? 'error' : 'success',
    },
    secondaryResults: [
      { id: 'annualTax', label: 'Total Annual Tax', value: formatPKR(totalAnnualTax), type: 'currency' },
      { id: 'monthlyTakeHome', label: 'Monthly Net Take-Home', value: formatPKR(monthlyTakeHome), type: 'currency' },
      { id: 'effectiveRate', label: 'Effective Tax Rate', value: formatPercent(effectiveRate), type: 'percentage' },
      { id: 'marginalRate', label: 'Marginal (Slab) Rate', value: formatPercent(marginalRate), type: 'percentage' },
    ],
    breakdown,
    chartType: 'pie',
    chartData,
    notes: [
      'Calculated as per Federal Board of Revenue (FBR) Tax Year 2027 (FY 2026-27) slabs under the Finance Act 2026.',
      isSalaried
        ? 'Salaried individual tax slabs applied (>75% income from salary). Surcharge abolished for salaried persons under Finance Act 2026.'
        : 'Non-salaried / Business individual tax slabs applied. 10% surcharge applies if annual income exceeds Rs. 10 Million.',
    ],
  };
}

/**
 * Calculates Freelancer and IT Exporters Tax
 * Section 154A — PSEB 0.25% Concessionary Regime (extended through TY2029) vs 1.25% General
 */
export function calculateFreelancerTax(inputs: Record<string, any>): CalculatorOutput {
  const isPsebRegistered = inputs.isPsebRegistered !== false;
  const annualIncomePKR = safeNumber(inputs.annualIncome, 4200000);
  const remittanceChannel = inputs.remittanceChannel || 'banking'; // banking vs digital

  let taxRate = 0;
  let taxRegimeName = '';

  if (isPsebRegistered && remittanceChannel === 'banking') {
    taxRate = 0.0025; // 0.25% Final Tax under Section 154A (Extended through TY 2029)
    taxRegimeName = '0.25% Concessionary Final Tax (Section 154A - PSEB Registered)';
  } else if (!isPsebRegistered && remittanceChannel === 'banking') {
    taxRate = 0.0125; // 1.25% Withholding Tax on General IT/Export Inward Remittances
    taxRegimeName = '1.25% Final Tax on Inward Export Remittances (Non-PSEB)';
  } else {
    // Normal Business Slab
    taxRate = 0.15;
    taxRegimeName = 'Normal Tax Slabs (Non-Export / Non-Banking Channels)';
  }

  const totalAnnualTax = annualIncomePKR * taxRate;
  const monthlyTax = totalAnnualTax / 12;
  const netEarnings = annualIncomePKR - totalAnnualTax;

  return {
    primaryResult: {
      id: 'annualTax',
      label: 'Annual Tax Payable',
      value: formatPKR(totalAnnualTax),
      type: 'currency',
      highlight: true,
      color: 'success',
      subtext: taxRegimeName,
    },
    secondaryResults: [
      { id: 'monthlyTax', label: 'Monthly Tax', value: formatPKR(monthlyTax), type: 'currency' },
      { id: 'netIncome', label: 'Annual Take-Home Income', value: formatPKR(netEarnings), type: 'currency' },
      { id: 'effectiveRate', label: 'Tax Rate', value: `${(taxRate * 100).toFixed(2)}%`, type: 'percentage' },
    ],
    breakdown: [
      { label: 'Annual Foreign Remittance Income (PKR)', amount: formatPKR(annualIncomePKR) },
      { label: 'Tax Regime Applied', detail: taxRegimeName, amount: `${(taxRate * 100).toFixed(2)}%` },
      { label: 'Annual Tax Amount', amount: formatPKR(totalAnnualTax), isTotal: true },
      { label: 'Monthly Average Tax', amount: formatPKR(monthlyTax) },
    ],
    chartType: 'pie',
    chartData: [
      { name: 'Net Earnings', value: Math.round(netEarnings), color: '#16a34a' },
      { name: 'Tax Deducted', value: Math.round(totalAnnualTax), color: '#3b82f6' },
    ],
    notes: [
      'Under Section 154A, PSEB-registered IT/ITeS service exporters enjoy a concessionary 0.25% final tax rate on foreign remittances through banking channels (extended through Tax Year 2029).',
      'Unregistered IT exporters receiving inward home remittances through banking channels are taxed at 1.25%.',
    ],
  };
}

/**
 * Property Advance Tax & Transfer Fee Calculator (Sections 236C & 236K)
 */
export function calculatePropertyTax(inputs: Record<string, any>): CalculatorOutput {
  const propertyValue = safeNumber(inputs.propertyValue, 18000000); // Rs 1.8 Crore
  const isFiler = inputs.isFiler !== false;
  const isBuying = inputs.transactionType === 'buy';

  // Section 236K (Buyer) & 236C (Seller) Advance Tax (Budget 2026-27 Salient Features)
  // 236C (Seller): Flat 2.75% for filers (10% for non-filers)
  // 236K (Buyer): Flat 1.5% for filers (10.5% for non-filers)
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
