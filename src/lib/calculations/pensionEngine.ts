import { GovernmentType, BudgetYear } from '../../types/government';
import { CalculatorOutput, BreakdownRow, ChartDataPoint } from '../../types/calculator';
import { getPensionRules, getCommutationFactor } from '../../data/pension';
import { formatPKR, safeNumber } from '../utils/formatters';

export interface PensionEngineInputs {
  government?: GovernmentType;
  year?: BudgetYear;
  schemeType?: 'pre2024' | 'post2024' | string;
  basicPay?: number | string;
  serviceYears?: number | string;
  age?: number | string;
  commutationPercent?: number | string;
  bps?: number | string;
}

/**
 * Pure calculation engine for Pakistan Government Civil Servants Pension (Federal & Provincial)
 */
export function calculatePension(inputs: PensionEngineInputs): CalculatorOutput {
  const govType: GovernmentType = (inputs.government as GovernmentType) || 'federal';
  const schemeType = inputs.schemeType || 'pre2024';
  const basicPay = Math.max(safeNumber(inputs.basicPay, 85000), 1000);
  const serviceYears = Math.min(Math.max(safeNumber(inputs.serviceYears, 30), 10), 35);
  const age = Math.min(Math.max(safeNumber(inputs.age, 60), 45), 65);
  const commPercent = Math.min(Math.max(safeNumber(inputs.commutationPercent, 35), 0), 35);
  const bps = Math.min(Math.max(safeNumber(inputs.bps, 17), 1), 22);

  const rules = getPensionRules(govType);

  // 1. Post-2024 FGDC Defined Contribution Scheme (VPS Fund)
  if (schemeType === 'post2024' && rules.post2024Scheme.enabled) {
    const empRate = rules.post2024Scheme.employeeContributionRate;
    const govRate = rules.post2024Scheme.governmentContributionRate;
    const totalRate = empRate + govRate;
    const monthlyTotalContribution = basicPay * totalRate;
    const annualContribution = monthlyTotalContribution * 12;

    const r = 0.12 / 12; // 12% annual nominal return
    const months = serviceYears * 12;
    // Future value of monthly annuity: FV = PMT * [((1+r)^n - 1) / r]
    const accumulatedCorpus = monthlyTotalContribution * ((Math.pow(1 + r, months) - 1) / r);
    const estimatedMonthlyAnnuity = accumulatedCorpus * 0.007; // ~8.4% annual withdrawal / annuity payout

    const breakdown: BreakdownRow[] = [
      { label: 'Employee Monthly Contribution (10%)', amount: formatPKR(basicPay * empRate) },
      { label: 'Government Monthly Contribution (12%)', amount: formatPKR(basicPay * govRate) },
      { label: 'Total Monthly Inflow into VPS Fund (22%)', amount: formatPKR(monthlyTotalContribution), isTotal: true },
      { label: `Qualifying Service Duration (${serviceYears} Years)`, amount: `${months} Months` },
      { label: 'Projected Retirement Corpus at Superannuation', amount: formatPKR(accumulatedCorpus), highlight: true } as any,
      { label: 'Estimated Monthly Annuity Pension Payout', amount: formatPKR(estimatedMonthlyAnnuity), isTotal: true },
    ];

    const chartData: ChartDataPoint[] = [
      { name: 'Employee Contributions', value: Math.round(basicPay * empRate * months), color: '#3b82f6' },
      { name: 'Govt Contributions', value: Math.round(basicPay * govRate * months), color: '#16a34a' },
      { name: 'Compounded Investment Returns', value: Math.round(accumulatedCorpus - (annualContribution * serviceYears)), color: '#f59e0b' },
    ];

    return {
      primaryResult: {
        id: 'annuity',
        label: 'Estimated Monthly Annuity Pension',
        value: formatPKR(estimatedMonthlyAnnuity),
        type: 'currency',
        highlight: true,
        subtext: `FGDC Defined Contribution Scheme | Corpus: ${formatPKR(accumulatedCorpus)}`,
        color: 'success',
      },
      secondaryResults: [
        { id: 'corpus', label: 'Accumulated Pension Wealth', value: formatPKR(accumulatedCorpus), type: 'currency' },
        { id: 'monthlyInflow', label: 'Monthly VPS Investment (22%)', value: formatPKR(monthlyTotalContribution), type: 'currency' },
      ],
      breakdown,
      chartType: 'pie',
      chartData,
      notes: [
        `Covered under FGDC Defined Contribution Scheme (effective for new entrants from 1 July 2024).`,
        `Employee contributes 10%, Government provides matching 12% into SECP-registered pension fund.`,
        `Assumes long-term nominal compound return of 12.0% per annum.`,
      ],
    };
  }

  // 2. Pre-2024 Defined Benefit Pension Scheme (Official Statutory Formula)
  const qualifyingYears = Math.min(serviceYears, 30);
  const grossPensionUncapped = (basicPay * qualifyingYears * 7) / 300;
  const maxAllowableGross = basicPay * 0.70;
  const grossPension = Math.min(grossPensionUncapped, maxAllowableGross);

  const commutedMonthlyFraction = grossPension * (commPercent / 100);
  const commutationFactor = getCommutationFactor(age);
  const lumpSumGratuity = commutedMonthlyFraction * 12 * commutationFactor;

  let netMonthlyPension = grossPension - commutedMonthlyFraction;

  // Medical Allowance for Pensioners (25% for BPS 1-16, 20% for BPS 17-22 or min 4000)
  const medicalAllowanceRate = bps <= 16 ? 0.25 : 0.20;
  const medicalAllowance = Math.max(Math.round(netMonthlyPension * medicalAllowanceRate), 4000);

  let totalMonthlyPensionPayable = netMonthlyPension + medicalAllowance;

  // Minimum pension floor enforcement (Rs. 25,000 / month)
  if (totalMonthlyPensionPayable < rules.minimumPension) {
    totalMonthlyPensionPayable = rules.minimumPension;
    netMonthlyPension = rules.minimumPension - medicalAllowance;
  }

  const restorationAge = age + Math.round(commutationFactor);

  const breakdown: BreakdownRow[] = [
    { label: 'Last Drawn Running Basic Pay', amount: formatPKR(basicPay) },
    {
      label: `Qualifying Service Years (${qualifyingYears} / 30 years cap)`,
      amount: `${qualifyingYears} Years`,
    },
    {
      label: 'Gross Pension Calculation Formula: (Pay × Service × 7) ÷ 300',
      amount: formatPKR(grossPension),
      detail: `Capped at 70% of last drawn basic pay (${((grossPension / basicPay) * 100).toFixed(1)}%)`,
    },
    {
      label: `Commuted Portion Surrendered (${commPercent}% of Gross Pension)`,
      amount: formatPKR(commutedMonthlyFraction),
      detail: `Factor at Age ${age}: ${commutationFactor.toFixed(2)}`,
      isDeduction: true,
    },
    {
      label: `Lump-Sum Commutation Cash Received (${commPercent}% × 12 × Factor ${commutationFactor.toFixed(2)})`,
      amount: formatPKR(lumpSumGratuity),
      highlight: true,
    } as any,
    {
      label: 'Net Monthly Basic Pension',
      amount: formatPKR(netMonthlyPension),
    },
    {
      label: `Pensioners Medical Allowance (${(medicalAllowanceRate * 100).toFixed(0)}% — Min Rs. 4,000)`,
      amount: formatPKR(medicalAllowance),
    },
    {
      label: 'Total Net Monthly Pension Disbursed into Bank',
      amount: formatPKR(totalMonthlyPensionPayable),
      isTotal: true,
    },
    {
      label: `Full Pension Restoration Age (after ${Math.round(commutationFactor)} years)`,
      amount: `Age ${restorationAge} (Gross: ${formatPKR(grossPension + medicalAllowance)}/mo)`,
    },
  ];

  const chartData: ChartDataPoint[] = [
    { name: 'Commutation Lump Sum (Immediate)', value: Math.round(lumpSumGratuity), color: '#16a34a' },
    { name: 'Net Annual Monthly Pension', value: Math.round(totalMonthlyPensionPayable * 12), color: '#3b82f6' },
  ];

  return {
    primaryResult: {
      id: 'netMonthlyPension',
      label: 'Total Monthly Pension (In-Hand)',
      value: formatPKR(totalMonthlyPensionPayable),
      type: 'currency',
      highlight: true,
      subtext: `${rules.governmentName} | Commutation Lump Sum: ${formatPKR(lumpSumGratuity)}`,
      color: 'success',
    },
    secondaryResults: [
      { id: 'lumpSum', label: 'Commutation Lump Sum (Tax-Free)', value: formatPKR(lumpSumGratuity), type: 'currency' },
      { id: 'grossPension', label: 'Gross Monthly Pension (70% Max)', value: formatPKR(grossPension), type: 'currency' },
      { id: 'medical', label: 'Pensioner Medical Allowance', value: formatPKR(medicalAllowance), type: 'currency' },
      { id: 'restoration', label: 'Restoration Age', value: `Age ${restorationAge}`, type: 'text' },
    ],
    breakdown,
    chartType: 'pie',
    chartData,
    notes: [
      `Official Source: CSR (Civil Service Regulations) Art. 468-A & Finance Division Commutation Purchase Table.`,
      `Commutation factor for Age ${age} is ${commutationFactor.toFixed(2)} years.`,
      `Minimum monthly pension floor of Rs. ${rules.minimumPension.toLocaleString()} strictly enforced.`,
      ...rules.notes,
    ],
  };
}
