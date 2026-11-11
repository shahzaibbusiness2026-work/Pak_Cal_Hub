import { GovernmentType, BudgetYear } from '../../types/government';
import { CalculatorOutput, BreakdownRow, ChartDataPoint } from '../../types/calculator';
import { getPensionRules, getCommutationFactor } from '../../data/pension';
import { formatPKR, safeNumber } from '../utils/formatters';
import { invalidInput } from '../calculators/validation';

export interface PensionEngineInputs {
  government?: GovernmentType;
  year?: BudgetYear;
  schemeType?: 'pre2024' | 'postReform' | 'post2024' | string;
  basicPay?: number | string;
  serviceYears?: number | string;
  age?: number | string;
  commutationPercent?: number | string;
  bps?: number | string;
  /** Average emoluments of the last 24 months (federal pension reform, retirements on/after 1 January 2025). */
  avgLast24MoPay?: number | string;
  /** Retirement year/month drive auto-selection of the post-reform (24-month average) path. */
  retirementYear?: number | string;
  retirementMonth?: number | string;
  notionalIncrement?: number | string;
  sanctionedMedical?: number | string;
  sanctionedIncreases?: number | string;
  baselinePension?: number | string;
  apply2026Increase?: boolean;
}

/**
 * Federal pension reform: retirements on/after 1 January 2025 are computed on the
 * average emoluments of the last 24 months instead of last-drawn basic pay
 * (Finance Division clarification OM F.No.9(3)R-6/2024-401).
 * Pre-2025 retirements keep last-drawn basic pay as the emoluments base.
 */
function isPostReformRetirement(inputs: PensionEngineInputs): boolean {
  const year = Math.floor(safeNumber(inputs.retirementYear, 0));
  if (year > 2025) return true;
  if (year === 2025) return true;
  return false;
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
  if (schemeType === 'post2024' && govType !== 'federal') return invalidInput('Provincial contribution schemes have different entry dates and rates. Use the applicable provincial notification; this projection supports the federal scheme only.');

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
        'Illustrative projection only: it holds today\'s basic pay and contributions constant and does not predict market returns, pay increases, fund charges, or the annuity rate available at retirement. Your actual VPS pension will differ.',
      ],
    };
  }

  // 2. Defined Benefit Pension Scheme (Official Statutory Formula)
  // Emoluments base: the federal pension reform uses the AVERAGE emoluments of the last
  // 24 months for retirements on/after 1 January 2025 (Finance Division clarification
  // OM F.No.9(3)R-6/2024-401); pre-2025 retirements keep last-drawn basic pay.
  const avgLast24MoPay = Math.max(safeNumber(inputs.avgLast24MoPay, 0), 0);
  const useReformAverage = schemeType === 'postReform' || (govType === 'federal' && isPostReformRetirement(inputs));
  if (useReformAverage && avgLast24MoPay <= 0) return invalidInput('Enter the average pensionable emoluments of the last 24 months. Last basic pay cannot silently replace this average.');
  const emolumentsBase = (useReformAverage ? avgLast24MoPay : basicPay) + Math.max(0, safeNumber(inputs.notionalIncrement, 0));

  const qualifyingYears = Math.min(serviceYears, 30);
  const grossPensionUncapped = (emolumentsBase * qualifyingYears * 7) / 300;
  const maxAllowableGross = emolumentsBase * 0.70;
  const preFloorGrossPension = Math.min(grossPensionUncapped, maxAllowableGross);

  // Minimum pension floor applies to GROSS pension (Finance Division OM No.F.15(1)-Reg.6/2023
  // dated 05-07-2023: floor raised to Rs. 12,000/month w.e.f. 01-07-2023). The top-up is
  // non-commutable: "Commutation of any part of the increase allowed vide this O.M. will
  // not be admissible."
  const floorTopUp = Math.max(0, rules.minimumPension - preFloorGrossPension);
  const grossPension = preFloorGrossPension + floorTopUp;

  // Commutation is computed on the PRE-FLOOR gross pension (floor top-up is non-commutable).
  const commutedMonthlyFraction = preFloorGrossPension * (commPercent / 100);
  // The `age` input is the age on the date commutation becomes absolute; the CSR commutation
  // table is keyed on age at NEXT birthday, hence the +1.
  const commutationFactor = getCommutationFactor(age + 1);
  const lumpSumGratuity = commutedMonthlyFraction * 12 * commutationFactor;

  const netMonthlyPension = grossPension - commutedMonthlyFraction;

  // Medical Allowance for Pensioners: 25% for BPS 1-15, 20% for BPS 16-22
  // (Finance Division 2010 notification). No statutory minimum floor applies.
  const medicalAllowanceRate = bps <= 15 ? 0.25 : 0.20;
  const enteredMedical = safeNumber(inputs.sanctionedMedical, -1);
  const medicalAllowance = enteredMedical >= 0 ? enteredMedical : Math.round(netMonthlyPension * medicalAllowanceRate);
  const sanctionedIncreases = Math.max(0, safeNumber(inputs.sanctionedIncreases, 0));
  const baseline = Math.max(0, safeNumber(inputs.baselinePension, 0));
  if (inputs.apply2026Increase && (govType !== 'federal' || baseline <= 0)) return invalidInput('The federal 2026 increase requires the sanctioned baseline pension, excluding medical allowance. Confirm the baseline with your accounts office.');
  const increase2026 = inputs.apply2026Increase ? Math.round(baseline * 0.07) : 0;

  const totalMonthlyPensionPayable = netMonthlyPension + medicalAllowance + sanctionedIncreases + increase2026;

  const restorationAge = age + Math.round(commutationFactor);

  const breakdown: BreakdownRow[] = [
    {
      label: useReformAverage
        ? 'Average Emoluments of Last 24 Months (Federal Pension Reform, retirements on/after 1 Jan 2025 — OM F.No.9(3)R-6/2024-401)'
        : 'Last Drawn Running Basic Pay',
      amount: formatPKR(emolumentsBase),
    },
    {
      label: `Qualifying Service Years (${qualifyingYears} / 30 years cap)`,
      amount: `${qualifyingYears} Years`,
    },
    {
      label: 'Gross Pension Calculation Formula: (Emoluments × Service × 7) ÷ 300',
      amount: formatPKR(preFloorGrossPension),
      detail: `Capped at 70% of emoluments base (${((preFloorGrossPension / emolumentsBase) * 100).toFixed(1)}%)`,
    },
  ];

  if (floorTopUp > 0) {
    breakdown.push({
      label: `Minimum Pension Floor Top-Up to Rs. ${rules.minimumPension.toLocaleString()} (non-commutable, OM No.F.15(1)-Reg.6/2023)`,
      amount: formatPKR(floorTopUp),
    });
  }

  breakdown.push(
    {
      label: `Commuted Portion Surrendered (${commPercent}% of Pre-Floor Gross Pension)`,
      amount: formatPKR(commutedMonthlyFraction),
      detail: `Factor for age next birthday ${age + 1}: ${commutationFactor.toFixed(4)}`,
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
      label: enteredMedical >= 0 ? 'Sanctioned medical allowance (entered)' : `Illustrative medical allowance (${(medicalAllowanceRate * 100).toFixed(0)}%; confirm frozen entitlement)`,
      amount: formatPKR(medicalAllowance),
    },
    {
      label: 'Estimated Monthly Pension Including Entered Additions',
      amount: formatPKR(totalMonthlyPensionPayable),
      isTotal: true,
    },
    {
      label: 'Approximate Restoration Age (confirm the sanctioned date)',
      amount: `Around age ${restorationAge}; actual restoration depends on the applicable order`,
    }
  );
  breakdown.push({ label: 'Other sanctioned monthly pension increases (entered)', amount: formatPKR(sanctionedIncreases) });
  if (inputs.apply2026Increase) breakdown.push({ label: 'Federal 2026 increase: 7% of entered baseline', amount: formatPKR(increase2026) });

  const chartData: ChartDataPoint[] = [
    { name: 'Commutation Lump Sum (Immediate)', value: Math.round(lumpSumGratuity), color: '#16a34a' },
    { name: 'Net Annual Pension', value: Math.round(totalMonthlyPensionPayable * 12), color: '#3b82f6' },
  ];

  return {
    primaryResult: {
      id: 'netMonthlyPension',
      label: 'Estimated Monthly Pension',
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
      { id: 'restoration', label: 'Approximate Restoration Age', value: `Around age ${restorationAge}`, type: 'text' },
    ],
    breakdown,
    chartType: 'pie',
    chartData,
    notes: [
      'Estimate only: voluntary-retirement penalties, provincial reforms, eligibility and historical increases are not automatically determined. Enter sanctioned medical allowance and increases; zero means they are excluded. Do not include the 2026 increase twice.',
      'Federal 7% increase from 1 July 2026 applies to the sanctioned baseline, not simply 7% of last basic pay. The baseline must be confirmed under the applicable orders (OM 29-07-2026).',
      'The usual/notional retiring-year increment, where admissible, is added after the 24-month average (FD clarification 04-03-2025). Transitional LPR exceptions require accounts-office confirmation.',
      `Official Source: CSR (Civil Service Regulations) Art. 468-A & Finance Division Commutation Purchase Table.`,
      `Commutation factor ${commutationFactor.toFixed(2)} years (CSR table: age on next birthday).`,
      `Minimum pension floor of Rs. ${rules.minimumPension.toLocaleString()}/month applies to gross pension (Finance Division OM No.F.15(1)-Reg.6/2023); the floor top-up is non-commutable.`,
      ...(useReformAverage
        ? [
            'Retirement on/after 1 Jan 2025: pension is computed on average emoluments of the last 24 months per the federal pension reform (OM F.No.9(3)R-6/2024-401). Pre-2025 retirements use last-drawn basic pay.',
          ]
        : []),
      ...rules.notes,
    ],
  };
}
