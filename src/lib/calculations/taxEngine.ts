import { TaxYear } from '../../types/government';
import { CalculatorOutput, BreakdownRow, ChartDataPoint } from '../../types/calculator';
import { getTaxDataset } from '../../data/tax';
import { formatPKR, safeNumber } from '../utils/formatters';

export interface TaxEngineInputs {
  taxYear?: TaxYear;
  incomeType?: 'salaried' | 'business' | 'freelancer' | string;
  incomePeriod?: 'monthly' | 'annual' | string;
  income?: number | string;
  isSenior?: boolean;
  isPsebRegistered?: boolean;
}

/**
 * Pure calculation engine for Pakistan Income Tax (FBR Tax Year 2025, 2026, 2027)
 */
export function calculateTax(inputs: TaxEngineInputs): CalculatorOutput {
  const taxYear: TaxYear = (inputs.taxYear as TaxYear) || '2026-27';
  const incomeType = inputs.incomeType || 'salaried';
  const incomePeriod = inputs.incomePeriod || 'monthly';
  const rawIncome = Math.max(safeNumber(inputs.income, 120000), 0);
  const isSenior = Boolean(inputs.isSenior);
  const isPsebRegistered = inputs.isPsebRegistered !== false;

  const dataset = getTaxDataset(taxYear);

  const annualIncome = incomePeriod === 'monthly' ? rawIncome * 12 : rawIncome;
  const monthlyGross = annualIncome / 12;

  // Freelancer Section 154A
  if (incomeType === 'freelancer') {
    const rate = isPsebRegistered
      ? dataset.freelancerExportTax.psebRate
      : dataset.freelancerExportTax.generalRate;
    const annualTax = Math.round(annualIncome * rate);
    const monthlyTax = Math.round(annualTax / 12);
    const netAnnual = annualIncome - annualTax;
    const netMonthly = netAnnual / 12;

    const breakdown: BreakdownRow[] = [
      { label: 'Annual Freelance IT / ITES Export Revenue', amount: formatPKR(annualIncome) },
      { label: 'Monthly Equivalent Revenue', amount: formatPKR(monthlyGross) },
      {
        label: `Withholding Tax under Section 154A (${(rate * 100).toFixed(2)}% — ${isPsebRegistered ? 'PSEB Registered' : 'Non-PSEB'})`,
        amount: formatPKR(annualTax),
        isDeduction: true,
      },
      { label: 'Monthly Tax Deduction (TDS)', amount: formatPKR(monthlyTax), isDeduction: true },
      { label: 'Net Annual Foreign Remittance Retained', amount: formatPKR(netAnnual), isTotal: true },
    ];

    const chartData: ChartDataPoint[] = [
      { name: 'Net In-Hand Remittance', value: Math.round(netAnnual), color: '#16a34a' },
      { name: 'FBR Final Tax (Section 154A)', value: Math.round(annualTax), color: '#ef4444' },
    ];

    return {
      primaryResult: {
        id: 'taxMonthly',
        label: 'Monthly Withholding Tax (TDS)',
        value: formatPKR(monthlyTax),
        type: 'currency',
        highlight: true,
        subtext: `Annual Tax: ${formatPKR(annualTax)} (${(rate * 100).toFixed(2)}% Final Tax)`,
        color: monthlyTax > 0 ? 'warning' : 'success',
      },
      secondaryResults: [
        { id: 'netMonthly', label: 'Net Monthly Income', value: formatPKR(netMonthly), type: 'currency' },
        { id: 'annualTax', label: 'Total Annual FBR Tax', value: formatPKR(annualTax), type: 'currency' },
        { id: 'taxRate', label: 'Applicable Tax Rate', value: `${(rate * 100).toFixed(2)}%`, type: 'percentage' },
      ],
      breakdown,
      chartType: 'pie',
      chartData,
      notes: [
        `Applicable under ${dataset.freelancerExportTax.section}.`,
        `PSEB registered IT exporters enjoy a 0.25% concessionary final withholding tax regime.`,
      ],
    };
  }

  // Standard Salaried / Non-Salaried Income Tax
  const slabs = incomeType === 'business' ? dataset.nonSalariedSlabs : dataset.salariedSlabs;

  let baseAnnualTax = 0;
  let marginalRate = 0;
  let activeSlabIndex = 0;

  for (let i = 0; i < slabs.length; i++) {
    const slab = slabs[i];
    if (annualIncome > slab.min) {
      activeSlabIndex = i;
      marginalRate = slab.rate;
      if (annualIncome <= slab.max) {
        baseAnnualTax = slab.fixedTax + (annualIncome - slab.min) * slab.rate;
        break;
      } else if (i === slabs.length - 1) {
        baseAnnualTax = slab.fixedTax + (annualIncome - slab.min) * slab.rate;
        break;
      }
    }
  }

  // Surcharge (High Income Surcharge > 10M)
  let surcharge = 0;
  if (annualIncome > dataset.surcharge.threshold) {
    if (incomeType === 'business' || (incomeType === 'salaried' && dataset.surcharge.appliesToSalaried)) {
      surcharge = baseAnnualTax * dataset.surcharge.rate;
    }
  }

  // Senior citizen rebate (50% tax rebate if income <= 1M and age >= 60)
  let seniorRebate = 0;
  if (isSenior && annualIncome <= 1000000) {
    seniorRebate = baseAnnualTax * 0.5;
  }

  const finalAnnualTax = Math.max(Math.round(baseAnnualTax + surcharge - seniorRebate), 0);
  const monthlyTax = Math.round(finalAnnualTax / 12);
  const netAnnualIncome = annualIncome - finalAnnualTax;
  const netMonthlyIncome = netAnnualIncome / 12;
  const effectiveRate = annualIncome > 0 ? (finalAnnualTax / annualIncome) * 100 : 0;

  const breakdown: BreakdownRow[] = [
    { label: 'Gross Annual Taxable Income', amount: formatPKR(annualIncome) },
    { label: 'Gross Monthly Income', amount: formatPKR(monthlyGross) },
    {
      label: `Applicable FBR Tax Slab (${dataset.actTitle})`,
      amount: slabs[activeSlabIndex]?.rateLabel || '0%',
    },
    { label: 'Basic Computed Income Tax', amount: formatPKR(baseAnnualTax) },
  ];

  if (surcharge > 0) {
    breakdown.push({
      label: `High Earner Surcharge (10% on tax exceeding Rs. 10M income)`,
      amount: formatPKR(surcharge),
      isDeduction: true,
    });
  }

  if (seniorRebate > 0) {
    breakdown.push({
      label: 'Senior Citizen Tax Rebate (50% Exemption)',
      amount: `-${formatPKR(seniorRebate)}`,
    });
  }

  breakdown.push(
    { label: 'Total Annual FBR Income Tax Liability', amount: formatPKR(finalAnnualTax), isTotal: true },
    { label: 'Monthly Tax Deduction at Source (TDS)', amount: formatPKR(monthlyTax), isDeduction: true },
    { label: 'Net In-Hand Monthly Take-Home Pay', amount: formatPKR(netMonthlyIncome), isTotal: true }
  );

  const chartData: ChartDataPoint[] = [
    { name: 'Net Take-Home Pay', value: Math.round(netAnnualIncome), color: '#16a34a' },
    { name: 'FBR Income Tax', value: Math.round(finalAnnualTax), color: '#ef4444' },
  ];

  return {
    primaryResult: {
      id: 'monthlyTax',
      label: 'Monthly Income Tax (TDS Deduction)',
      value: formatPKR(monthlyTax),
      type: 'currency',
      highlight: true,
      subtext: `Annual Tax: ${formatPKR(finalAnnualTax)} | Effective Tax Rate: ${effectiveRate.toFixed(2)}%`,
      color: monthlyTax > 0 ? 'warning' : 'success',
    },
    secondaryResults: [
      { id: 'netMonthly', label: 'Net Monthly Income', value: formatPKR(netMonthlyIncome), type: 'currency' },
      { id: 'annualTax', label: 'Annual Income Tax', value: formatPKR(finalAnnualTax), type: 'currency' },
      { id: 'effectiveRate', label: 'Effective Tax Rate', value: `${effectiveRate.toFixed(2)}%`, type: 'percentage' },
      { id: 'marginalRate', label: 'Marginal Tax Rate', value: `${(marginalRate * 100).toFixed(0)}%`, type: 'percentage' },
    ],
    breakdown,
    chartType: 'pie',
    chartData,
    notes: [
      `Official Source: ${dataset.actTitle} (${dataset.assessmentYear}).`,
      `Tax rates apply uniformly under First Schedule of Income Tax Ordinance 2001.`,
      `First Rs. 600,000 annual income (Rs. 50,000/month) is 100% tax-exempt.`,
      ...dataset.notes,
    ],
  };
}
