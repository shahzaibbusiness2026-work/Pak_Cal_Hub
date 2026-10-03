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
  // Family pension is 75% of gross pension, subject to the minimum family pension floor
  // (Rs. 9,000/month w.e.f. 01-07-2023 per Finance Division OM No.F.15(1)-Reg.6/2023;
  // "Commutation of any part of the increase ... will not be admissible").
  const familyBasicPension = Math.max(
    fullGrossPension * rules.familyPensionRate,
    rules.minimumFamilyPension ?? 9000
  );

  // Medical Allowance for Pensioners: 25% for BPS 1-15, 20% for BPS 16-22
  // (Finance Division 2010 notification). No statutory minimum floor applies.
  const medRate = bps <= 15 ? 0.25 : 0.20;
  const medicalAllowance = Math.round(familyBasicPension * medRate);

  const totalDisbursed = familyBasicPension + medicalAllowance;

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
      label: `Pensioners Medical Allowance (${(medRate * 100).toFixed(0)}% of family pension)`,
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
