import { GovernmentType, BudgetYear } from '../../types/government';
import { CalculatorOutput, BreakdownRow, ChartDataPoint } from '../../types/calculator';
import { getSalaryDataset } from '../../data/salary';
import { BPS_2017_MINIMUM, BPS_2022_MINIMUM } from '../../data/salary/initial-pay-tables';
import { getGpFundSlab, getGroupInsurance, getBenevolentFund } from '../../data/allowances/deduction-schedules';
import { formatPKR, safeNumber } from '../utils/formatters';

export interface SalaryEngineInputs {
  government?: GovernmentType;
  year?: BudgetYear;
  bps?: number | string;
  stage?: number | string;
  cityType?: 'big' | 'other' | 'none' | string;
  qualificationPay?: number | string;
  specialAllowance?: number | string;
  includeAdhoc?: boolean;
  includeDRA?: boolean;
  customHra?: number | string;
  customBasic?: number | string;
}

/**
 * Pure calculation engine for Pakistan Government Civil Servants Salary (Federal & 4 Provinces across FY24-27)
 */
export function calculateSalary(inputs: SalaryEngineInputs): CalculatorOutput {
  const govType: GovernmentType = (inputs.government as GovernmentType) || 'federal';
  const budgetYear: BudgetYear = (inputs.year as BudgetYear) || '2026-27';
  const bps = Math.min(Math.max(safeNumber(inputs.bps, 17), 1), 22);
  const stage = Math.max(safeNumber(inputs.stage, 0), 0);
  const cityType = inputs.cityType || 'big';
  const isBigCity = cityType === 'big';
  const isNoHra = cityType === 'none';
  const qualPay = Math.max(safeNumber(inputs.qualificationPay, 0), 0);
  const userSpecialAllowance = Math.max(safeNumber(inputs.specialAllowance, 0), 0);
  const includeAdhoc = inputs.includeAdhoc !== false;
  // DRA toggle: the federal DRA-2026 (15% of basic pay as on 30-06-2022, OM No. 14(2)R-3/2025)
  // is admissible to BPS 1-22, so it defaults ON there; other governments keep the
  // previous opt-in default. An explicit includeDRA value from the caller always wins.
  // NOTE: this toggle only gates DRA entries — other special allowances (e.g. Sindh
  // Personal Allowance) are statutory and always applied.
  const includeDRA =
    inputs.includeDRA !== undefined ? Boolean(inputs.includeDRA) : govType === 'federal';

  const dataset = getSalaryDataset(govType, budgetYear);
  const scale = dataset.scales[bps] || dataset.scales[17];

  const effectiveStage = Math.min(stage, scale.stages);
  const customBasic = safeNumber(inputs.customBasic, 0);
  const basicPay = customBasic > 0 ? customBasic : scale.minPay + effectiveStage * scale.increment;

  // 1. House Rent Allowance (HRA)
  const customHra = safeNumber(inputs.customHra, -1);
  let houseRentAllowance = 0;
  if (customHra >= 0) {
    houseRentAllowance = customHra;
  } else if (isNoHra) {
    houseRentAllowance = 0;
  } else if (isBigCity) {
    houseRentAllowance = scale.frozenHraBigCity;
  } else {
    houseRentAllowance = scale.frozenHraOtherCity;
  }

  // 2. Conveyance Allowance (OM Flat schedule)
  const conveyanceAllowance = scale.conveyanceAllowance;

  // 3. Medical Allowance (Finance Division; frozen).
  // Verified rule: Rs. 1,500/month flat for BPS 1-15; 15% of running basic pay
  // for BPS 16-22 (Finance Division 2012 anomaly clarification). Provincial
  // datasets retain their file values until verified against provincial notifications.
  const medicalAllowance =
    govType === 'federal'
      ? bps <= 15
        ? 1500
        : Math.round(basicPay * 0.15)
      : scale.medicalAllowance;

  // 4. Ad-hoc Relief Allowances (from dynamic dataset)
  const adhocDetails: { name: string; amount: number }[] = [];
  let totalAdhoc = 0;

  if (includeAdhoc && dataset.adhocReliefs && dataset.adhocReliefs.length > 0) {
    dataset.adhocReliefs.forEach((adhoc) => {
      let applicableRate = adhoc.rate;
      if (adhoc.bpsCondition && adhoc.bpsCondition.length > 0) {
        const cond = adhoc.bpsCondition.find((c) => {
          const min = c.min ?? 1;
          const max = c.max ?? 22;
          return bps >= min && bps <= max;
        });
        if (cond && typeof cond.rate === 'number') {
          applicableRate = cond.rate;
        }
      }
      const amount = Math.round(basicPay * applicableRate);
      adhocDetails.push({ name: adhoc.name, amount });
      totalAdhoc += amount;
    });
  }

  // 5. Special / Disparity Allowances
  // Statutory special allowances always apply; DRA entries honor the includeDRA toggle.
  let provincialDRA = 0;
  const specialAllowanceDetails: { name: string; amount: number }[] = [];
  if (dataset.specialAllowances && dataset.specialAllowances.length > 0) {
    dataset.specialAllowances.forEach((sa) => {
      const isDraEntry = sa.id.toLowerCase().includes('dra');
      if (isDraEntry && !includeDRA) return;
      // Honor the BPS scope (e.g. federal DRA-2026 is admissible to BPS 1-22 only).
      if (sa.applicableBps && sa.applicableBps.length > 0 && !sa.applicableBps.includes(bps)) {
        return;
      }
      let amount = 0;
      if (sa.rate) {
        // Honor the computation base: 'initial2017' / 'initial2022' entries are computed on the
        // FROZEN initial (minimum) of that pay scale - e.g. DRA = 25%/15% of BPS-2017 minimum -
        // not on the employee's current running basic pay.
        let rateBase = basicPay;
        if (sa.appliesTo === 'initial2017') {
          rateBase = BPS_2017_MINIMUM[bps] ?? basicPay;
        } else if (sa.appliesTo === 'initial2022') {
          rateBase = BPS_2022_MINIMUM[bps] ?? basicPay;
        }
        amount = Math.round(rateBase * sa.rate);
      } else if (sa.bpsAmounts) {
        // Per-BPS fixed monthly amounts, e.g. Sindh Personal Allowance 2026
        // (BPS-01: Rs. 401, BPS-02: Rs. 80).
        const key = String(bps);
        amount = Math.round(Number((sa.bpsAmounts as Record<string, number>)[key] ?? 0));
      } else if (sa.fixedAmount) {
        amount = sa.fixedAmount;
      }
      specialAllowanceDetails.push({ name: sa.name, amount });
      provincialDRA += amount;
    });
  }

  const totalAllowances =
    houseRentAllowance +
    medicalAllowance +
    conveyanceAllowance +
    totalAdhoc +
    provincialDRA +
    qualPay +
    userSpecialAllowance;

  const grossSalary = basicPay + totalAllowances;

  // 6. Deductions — verified statutory schedules (see src/data/allowances/deduction-schedules.ts).
  // GP Fund: fixed monthly slab by BPS (OM F.1(5)-Reg.7/87(Vol.1)-485/05, 18-08-2005), NOT a % of pay.
  // Benevolent Fund: 2% of basic, capped at Rs. 155/month (FEBF & GI Act, 3rd Schedule, 01-12-2003).
  // Group Insurance: pay-band slab, max Rs. 182/month (FEBF & GI Rules, 3rd Schedule, 01-01-1996).
  const gpFundDeduction = getGpFundSlab(bps);
  const benevolentFund = getBenevolentFund(basicPay);
  const groupInsurance = Math.round(getGroupInsurance(basicPay));
  const houseRentDeduction = isNoHra ? Math.round(basicPay * 0.05) : 0; // 5% HRD for Estate Office residence

  const totalDeductions = gpFundDeduction + benevolentFund + groupInsurance + houseRentDeduction;
  const netSalary = grossSalary - totalDeductions;

  // Formatting Breakdown Rows
  const breakdown: BreakdownRow[] = [
    {
      label: `Basic Pay (${dataset.scaleTitle} — BPS-${bps}, Stage ${effectiveStage})`,
      amount: formatPKR(basicPay),
      percentage: (basicPay / grossSalary) * 100,
    },
  ];

  if (isNoHra) {
    breakdown.push({
      label: 'House Rent Allowance (Govt Official Accommodation Allotted)',
      amount: 'Rs. 0 (Not Admissible)',
    });
  } else {
    breakdown.push({
      label: `House Rent Allowance (${isBigCity ? 'Specified Big City Schedule' : 'Non-Big City / Other Station'})`,
      amount: formatPKR(houseRentAllowance),
      percentage: (houseRentAllowance / grossSalary) * 100,
    });
  }

  breakdown.push(
    { label: 'Medical Allowance', amount: formatPKR(medicalAllowance), percentage: (medicalAllowance / grossSalary) * 100 },
    { label: 'Conveyance Allowance', amount: formatPKR(conveyanceAllowance), percentage: (conveyanceAllowance / grossSalary) * 100 }
  );

  adhocDetails.forEach((a) => {
    breakdown.push({ label: a.name, amount: formatPKR(a.amount), percentage: (a.amount / grossSalary) * 100 });
  });

  specialAllowanceDetails.forEach((sa) => {
    breakdown.push({ label: sa.name, amount: formatPKR(sa.amount), percentage: (sa.amount / grossSalary) * 100 });
  });

  if (qualPay > 0) {
    breakdown.push({ label: 'Qualification / Special Pay', amount: formatPKR(qualPay), percentage: (qualPay / grossSalary) * 100 });
  }

  if (userSpecialAllowance > 0) {
    breakdown.push({ label: 'Other Special Allowances', amount: formatPKR(userSpecialAllowance), percentage: (userSpecialAllowance / grossSalary) * 100 });
  }

  breakdown.push(
    { label: `GP Fund Subscription — BPS-${bps} Slab (Rs. ${gpFundDeduction.toLocaleString()}/month, OM 18-08-2005)`, amount: formatPKR(gpFundDeduction), isDeduction: true },
    { label: 'Benevolent Fund (2% of Basic, Max Rs. 155/month)', amount: formatPKR(benevolentFund), isDeduction: true },
    { label: `Group Insurance (Pay-Slab: Rs. ${groupInsurance}/month)`, amount: formatPKR(groupInsurance), isDeduction: true }
  );

  if (houseRentDeduction > 0) {
    breakdown.push({ label: '5% House-Rent Deduction (Govt Accommodation)', amount: formatPKR(houseRentDeduction), isDeduction: true });
  }

  breakdown.push({ label: 'Net Monthly Take-Home Pay', amount: formatPKR(netSalary), isTotal: true });

  // Chart Data
  const chartData: ChartDataPoint[] = [
    { name: 'Basic Pay', value: Math.round(basicPay), color: '#16a34a' },
  ];
  if (houseRentAllowance > 0) {
    chartData.push({ name: 'House Rent', value: Math.round(houseRentAllowance), color: '#3b82f6' });
  }
  if (totalAdhoc > 0) {
    chartData.push({ name: 'Ad-hoc Relief', value: Math.round(totalAdhoc), color: '#eab308' });
  }
  chartData.push({
    name: 'Other Allowances',
    value: Math.round(medicalAllowance + conveyanceAllowance + provincialDRA + qualPay + userSpecialAllowance),
    color: '#8b5cf6',
  });

  const hralabel = isNoHra ? 'Govt Quarter (0 HRA)' : isBigCity ? 'Big City HRA' : 'Non-Big City HRA';

  return {
    primaryResult: {
      id: 'netSalary',
      label: 'Monthly Net Take-Home Salary',
      value: formatPKR(netSalary),
      type: 'currency',
      highlight: true,
      subtext: `${dataset.governmentName} | BPS-${bps} (Stage ${effectiveStage}) | ${hralabel}`,
      color: 'success',
    },
    secondaryResults: [
      { id: 'grossSalary', label: 'Gross Monthly Salary', value: formatPKR(grossSalary), type: 'currency' },
      { id: 'basicPay', label: 'Running Basic Pay', value: formatPKR(basicPay), type: 'currency' },
      { id: 'totalAllowances', label: 'Total Allowances', value: formatPKR(totalAllowances), type: 'currency' },
      { id: 'totalDeductions', label: 'Monthly Deductions', value: formatPKR(totalDeductions), type: 'currency', color: 'warning' },
    ],
    breakdown,
    chartType: 'pie',
    chartData,
    notes: [
      `Official Source: ${dataset.notificationNumber} (${dataset.effectiveDate}).`,
      `Governed by ${dataset.governmentName} Budget (${dataset.year}).`,
      `GP Fund: Rs. ${gpFundDeduction.toLocaleString()}/month slab (Finance Division OM F.1(5)-Reg.7/87(Vol.1)-485/05, 18-08-2005).`,
      ...dataset.notes,
    ],
  };
}
