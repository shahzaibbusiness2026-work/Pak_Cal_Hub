import { GovernmentType, BudgetYear } from '../../types/government';
import { CalculatorOutput, BreakdownRow, ChartDataPoint } from '../../types/calculator';
import { getSalaryDataset } from '../../data/salary';
import { getGpfConfig } from '../../data/allowances';
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
  const includeDRA = Boolean(inputs.includeDRA);

  const dataset = getSalaryDataset(govType, budgetYear);
  const scale = dataset.scales[bps] || dataset.scales[17];
  const gpfConfig = getGpfConfig(budgetYear);

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

  // 3. Medical Allowance
  const medicalAllowance = scale.medicalAllowance;

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
  let provincialDRA = 0;
  const specialAllowanceDetails: { name: string; amount: number }[] = [];
  if (includeDRA && dataset.specialAllowances && dataset.specialAllowances.length > 0) {
    dataset.specialAllowances.forEach((sa) => {
      let amount = 0;
      if (sa.rate) {
        amount = Math.round(basicPay * sa.rate);
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

  // 6. Deductions
  const gpFundPct = bps <= 15 ? gpfConfig.mandatoryDeductions.bps1To15Rate : gpfConfig.mandatoryDeductions.bps16To22Rate;
  const gpFundDeduction = Math.round(basicPay * gpFundPct);
  const benevolentFund = Math.round(Math.min(basicPay * gpfConfig.benevolentFundRate, gpfConfig.benevolentFundMax));
  const groupInsurance = bps <= 15 ? gpfConfig.groupInsurance.bps1To15 : gpfConfig.groupInsurance.bps16To22;
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
    { label: `GP Fund Deduction (${(gpFundPct * 100).toFixed(0)}% — ${bps <= 15 ? 'BPS 1–15' : 'BPS 16–22 Officer'})`, amount: formatPKR(gpFundDeduction), isDeduction: true },
    { label: 'Benevolent Fund (2%, Max Rs. 2,500)', amount: formatPKR(benevolentFund), isDeduction: true },
    { label: `Group Insurance (${bps <= 15 ? 'Rs. 350' : 'Rs. 700'})`, amount: formatPKR(groupInsurance), isDeduction: true }
  );

  if (houseRentDeduction > 0) {
    breakdown.push({ label: 'Govt Accommodation 5% Maintenance Deduction (HRD)', amount: formatPKR(houseRentDeduction), isDeduction: true });
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
      `GP Fund Deduction rate: ${(gpFundPct * 100).toFixed(0)}% per Finance Division Schedule II.`,
      ...dataset.notes,
    ],
  };
}
