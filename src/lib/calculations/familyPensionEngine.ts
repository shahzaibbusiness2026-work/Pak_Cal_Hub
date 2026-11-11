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
  pensionBasis?: string;
  pensionDrawn?: number | string;
  sanctionedMedical?: number | string;
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
  const pensionBasis = inputs.pensionBasis === 'retired' ? Math.max(0, safeNumber(inputs.pensionDrawn, 0)) : fullGrossPension;
  const familyBasicPension = Math.max(
    pensionBasis * rules.familyPensionRate,
    rules.minimumFamilyPension ?? 9000
  );

  // Medical Allowance for Pensioners: 25% for BPS 1-15, 20% for BPS 16-22
  // (Finance Division 2010 notification). No statutory minimum floor applies.
  const medRate = bps <= 15 ? 0.25 : 0.20;
  const enteredMedical = safeNumber(inputs.sanctionedMedical, -1);
  const medicalAllowance = enteredMedical >= 0 ? enteredMedical : Math.round(familyBasicPension * medRate);

  const totalDisbursed = familyBasicPension + medicalAllowance;

  const breakdown: BreakdownRow[] = [
    { label: 'Deceased Employee Last Drawn Basic Pay', amount: formatPKR(basicPay) },
    { label: `Total Qualifying Government Service`, amount: `${serviceYears} Years` },
    { label: inputs.pensionBasis === 'retired' ? 'Entered Pension Being Drawn (Excluding Medical)' : 'Illustrative Gross Pension for Death in Service', amount: formatPKR(pensionBasis) },
    {
      label: `Admissible Family Pension Rate (${(rules.familyPensionRate * 100).toFixed(0)}% of Deceased Gross)`,
      amount: formatPKR(familyBasicPension),
    },
    {
      label: enteredMedical >= 0 ? 'Sanctioned Medical Allowance (entered)' : `Illustrative Medical Allowance (${(medRate * 100).toFixed(0)}%; confirm entitlement)`,
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
      label: 'Estimated Monthly Family Pension',
      value: formatPKR(totalDisbursed),
      type: 'currency',
      highlight: true,
      subtext: `${rules.governmentName} | Eligibility and duration require verification`,
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
      'This estimate does not determine beneficiary eligibility or payment duration. A lifetime entitlement for a spouse must not be assumed to apply to daughters or other heirs.',
      'For a federal pensioner who dies after retirement, use the pension being drawn, excluding medical, rather than reconstructing it from last basic pay (FD clarification 04-03-2025). Death-in-service estimates and provincial cases require the applicable sanction.',
      'Past pension increases and minimum floors depend on the applicable jurisdiction and dates; the reference floor and unentered amounts do not certify the sanctioned award.',
      ...rules.notes,
    ],
  };
}
