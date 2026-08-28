import { GovernmentType } from '../../types/government';
import { CalculatorOutput, BreakdownRow, ChartDataPoint } from '../../types/calculator';
import { getPensionRules } from '../../data/pension';
import { formatPKR, safeNumber } from '../utils/formatters';

export interface FamilyPensionInputs {
  government?: GovernmentType;
  lastBasicPay?: number | string;
  serviceYears?: number | string;
  deceasedBps?: number | string;
  isWidowLifetime?: boolean;
}

/**
 * Pure calculation engine for Family Pension for Surviving Dependents
 */
export function calculateFamilyPension(inputs: FamilyPensionInputs): CalculatorOutput {
  const govType: GovernmentType = (inputs.government as GovernmentType) || 'punjab';
  const basicPay = Math.max(safeNumber(inputs.lastBasicPay, 90000), 1000);
  const serviceYears = Math.min(Math.max(safeNumber(inputs.serviceYears, 28), 10), 30);
  const bps = Math.min(Math.max(safeNumber(inputs.deceasedBps, 16), 1), 22);

  const rules = getPensionRules(govType);

  // Full Gross Pension of deceased = (Basic * Service * 7) / 300 (max 70%)
  const fullGrossPension = Math.min((basicPay * serviceYears * 7) / 300, basicPay * 0.70);
  // Family pension is 75% of gross pension
  const familyBasicPension = fullGrossPension * rules.familyPensionRate;

  // Medical Allowance (25% for BPS 1-16, 20% for BPS 17-22, minimum 4,000)
  const medRate = bps <= 16 ? 0.25 : 0.20;
  const medicalAllowance = Math.max(Math.round(familyBasicPension * medRate), 4000);

  let totalDisbursed = familyBasicPension + medicalAllowance;
  if (totalDisbursed < rules.minimumPension) {
    totalDisbursed = rules.minimumPension;
  }

  const isLifetime = rules.familyPensionLifetimeWidow;

  const breakdown: BreakdownRow[] = [
    { label: 'Deceased Employee Last Drawn Basic Pay', amount: formatPKR(basicPay) },
    { label: `Total Qualifying Government Service`, amount: `${serviceYears} Years` },
    { label: 'Deceased Standard Gross Pension (100% Benchmark)', amount: formatPKR(fullGrossPension) },
    {
      label: `Admissible Family Pension Rate (${(rules.familyPensionRate * 100).toFixed(0)}% of Deceased Gross)`,
      amount: formatPKR(familyBasicPension),
    },
    {
      label: `Pensioners Medical Allowance (${(medRate * 100).toFixed(0)}% — Min Rs. 4,000)`,
      amount: formatPKR(medicalAllowance),
    },
    {
      label: 'Total Net Monthly Family Pension Disbursed',
      amount: formatPKR(totalDisbursed),
      isTotal: true,
    },
  ];

  const chartData: ChartDataPoint[] = [
    { name: 'Family Basic Pension', value: Math.round(familyBasicPension), color: '#16a34a' },
    { name: 'Medical Allowance', value: Math.round(medicalAllowance), color: '#3b82f6' },
  ];

  return {
    primaryResult: {
      id: 'familyPension',
      label: 'Monthly Family Pension Disbursed',
      value: formatPKR(totalDisbursed),
      type: 'currency',
      highlight: true,
      subtext: `${rules.governmentName} | ${isLifetime ? 'Lifetime Admissibility (Widows & Daughters)' : 'Statutory Standard Rules'}`,
      color: 'success',
    },
    secondaryResults: [
      { id: 'familyBasic', label: 'Basic Family Pension (75%)', value: formatPKR(familyBasicPension), type: 'currency' },
      { id: 'medical', label: 'Medical Allowance', value: formatPKR(medicalAllowance), type: 'currency' },
      { id: 'fullGross', label: 'Deceased Full Gross', value: formatPKR(fullGrossPension), type: 'currency' },
    ],
    breakdown,
    chartType: 'pie',
    chartData,
    notes: [
      `Official Reference: CSR Art. 468-A & Provincial Pension Rules.`,
      `Family pension rate is strictly 75% of full gross entitlement.`,
      ...rules.notes,
    ],
  };
}
