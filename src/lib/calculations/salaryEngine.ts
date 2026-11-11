import gpfRates from '../../data/allowances/gpf-rates.json';
import { GovernmentType, BudgetYear } from '../../types/government';
import { CalculatorOutput, BreakdownRow, ChartDataPoint } from '../../types/calculator';
import { getSalaryDataset } from '../../data/salary';
import { BPS_2017_MINIMUM, BPS_2022_MINIMUM } from '../../data/salary/initial-pay-tables';
import { getGpFundSlab, getGroupInsurance, getBenevolentFund } from '../../data/allowances/deduction-schedules';
import { formatPKR, safeNumber } from '../utils/formatters';
import { getTaxDataset } from '../../data/tax';
import { invalidInput } from '../calculators/validation';

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
  customMedical?: number | string;
  frozenAra2023?: number | string;
  frozenAra2024?: number | string;
  draBase2022?: number | string;
  customDra?: number | string;
  customDeductions?: number | string;
  customIncomeTax?: number | string;
  taxExemptAllowance?: number | string;
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
  // BPS scope alone does not establish eligibility (OM 14(2)R-3/2025).
  const includeDRA = inputs.includeDRA === true;

  const dataset = getSalaryDataset(govType, budgetYear);
  const scale = dataset.scales[bps] || dataset.scales[17];

  const effectiveStage = Math.min(stage, scale.stages);
  const customBasic = safeNumber(inputs.customBasic, 0);
  const basicPay = customBasic > 0 ? customBasic : scale.minPay + effectiveStage * scale.increment;

  // 1. House Rent Allowance (HRA)
  const customHra = safeNumber(inputs.customHra, -1);
  let houseRentAllowance = 0;
  if (isNoHra) {
    houseRentAllowance = 0;
  } else if (customHra >= 0) {
    houseRentAllowance = customHra;
  } else if (isBigCity) {
    houseRentAllowance = scale.frozenHraBigCity;
  } else {
    houseRentAllowance = scale.frozenHraOtherCity;
  }

  // 2. Conveyance Allowance (OM Flat schedule)
  const conveyanceAllowance = scale.conveyanceAllowance;

  // Federal new-entrant reference: BPS-2008 minimum x 15%, plus the 2015
  // 25% enhancement, with a Rs 1,500 floor. Existing employees use payroll's
  // frozen amount, not 15% of today's basic pay (FD OM 04-03-2015).
  const medicalBase2008: Record<number, number> = { 16: 6060, 17: 9850, 18: 12910, 19: 19680, 20: 23345, 21: 25880, 22: 27680 };
  const enteredMedical = safeNumber(inputs.customMedical, -1);
  const medicalAllowance =
    enteredMedical >= 0 ? enteredMedical : govType === 'federal'
      ? Math.max(1500, Math.round((medicalBase2008[bps] ?? 0) * 0.15 * 1.25))
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

  // ARA-2023/2024 continue separately after RBPS-2026. Their frozen amounts
  // cannot be recovered from the employee's present BPS/stage alone.
  if (includeAdhoc && govType === 'federal' && budgetYear === '2026-27') {
    for (const [name, entered, rate] of [
      ['Ad-hoc Relief Allowance 2023 (frozen)', inputs.frozenAra2023, bps <= 16 ? 0.35 : 0.30],
      ['Ad-hoc Relief Allowance 2024 (frozen)', inputs.frozenAra2024, bps <= 16 ? 0.25 : 0.20],
    ] as const) {
      const override = safeNumber(entered, -1);
      const amount = override >= 0 ? override : Math.round(BPS_2022_MINIMUM[bps] * rate);
      adhocDetails.push({ name, amount });
      totalAdhoc += amount;
    }
  }

  // 5. Special / Disparity Allowances
  // Statutory special allowances always apply; DRA entries honor the includeDRA toggle.
  let provincialDRA = 0;
  const specialAllowanceDetails: { name: string; amount: number }[] = [];
  if (dataset.specialAllowances && dataset.specialAllowances.length > 0) {
    dataset.specialAllowances.forEach((sa) => {
      const isDraEntry = sa.id.toLowerCase().includes('dra');
      if (isDraEntry && safeNumber(inputs.customDra, -1) >= 0) return;
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
          rateBase = safeNumber(inputs.draBase2022, 0);
          if (rateBase <= 0) return;
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
  const enteredDra = safeNumber(inputs.customDra, -1);
  if (includeDRA && enteredDra >= 0) {
    specialAllowanceDetails.push({ name: 'Sanctioned total DRA (entered)', amount: enteredDra });
    provincialDRA += enteredDra;
  } else if (includeDRA && govType === 'federal' && budgetYear === '2026-27' && safeNumber(inputs.draBase2022, 0) <= 0) {
    return invalidInput('Enter the sanctioned total DRA, or the basic pay as on 30 June 2022 used by your accounts office. Eligibility is required.');
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
  const revisedFederalGpf = govType === 'federal' && budgetYear === '2026-27';
  const gpFundDeduction = revisedFederalGpf
    ? Number(gpfRates.rates['2026-27'].monthlySubscriptionByBps[String(bps) as keyof typeof gpfRates.rates['2026-27']['monthlySubscriptionByBps']])
    : getGpFundSlab(bps);
  const benevolentFund = getBenevolentFund(basicPay);
  const groupInsurance = Math.round(getGroupInsurance(basicPay));
  const houseRentDeduction = isNoHra ? Math.round(basicPay * 0.05) : 0; // 5% HRD for Estate Office residence

  const enteredDeductions = safeNumber(inputs.customDeductions, -1);
  const payrollDeductions = enteredDeductions >= 0 ? enteredDeductions : gpFundDeduction + benevolentFund + groupInsurance + houseRentDeduction;
  const taxableMonthly = Math.max(0, grossSalary - Math.max(0, safeNumber(inputs.taxExemptAllowance, 0)));
  const taxDataset = getTaxDataset(budgetYear);
  const annualIncome = taxableMonthly * 12;
  const slab = [...taxDataset.salariedSlabs].reverse().find((item) => annualIncome > item.min);
  let annualTax = slab ? slab.fixedTax + (annualIncome - slab.min) * slab.rate : 0;
  if (taxDataset.surcharge.appliesToSalaried && annualIncome > taxDataset.surcharge.threshold) annualTax *= 1 + taxDataset.surcharge.rate;
  const enteredTax = safeNumber(inputs.customIncomeTax, -1);
  const incomeTax = enteredTax >= 0 ? enteredTax : Math.round(annualTax / 12);
  const totalDeductions = payrollDeductions + incomeTax;
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

  if (enteredDeductions < 0) breakdown.push(
    { label: `GP Fund Subscription — BPS-${bps} Slab (Rs. ${gpFundDeduction.toLocaleString()}/month, ${revisedFederalGpf ? 'OM 13-08-2026' : 'historical/reference schedule'})`, amount: formatPKR(gpFundDeduction), isDeduction: true },
    { label: 'Benevolent Fund (2% of Basic, Max Rs. 155/month)', amount: formatPKR(benevolentFund), isDeduction: true },
    { label: `Group Insurance (Pay-Slab: Rs. ${groupInsurance}/month)`, amount: formatPKR(groupInsurance), isDeduction: true }
  );

  if (houseRentDeduction > 0 && enteredDeductions < 0) {
    breakdown.push({ label: '5% House-Rent Deduction (Govt Accommodation)', amount: formatPKR(houseRentDeduction), isDeduction: true });
  }

  if (enteredDeductions >= 0) breakdown.push({ label: 'Entered payroll deductions excluding income tax', amount: formatPKR(payrollDeductions), isDeduction: true });
  breakdown.push({ label: enteredTax >= 0 ? 'Entered monthly income tax' : 'Estimated monthly salary income tax', amount: formatPKR(incomeTax), isDeduction: true });
  breakdown.push({ label: 'Estimated Net Monthly Pay', amount: formatPKR(netSalary), isTotal: true });

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
      label: 'Estimated Monthly Net Salary',
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
      'Payroll estimate: confirm the frozen allowances, eligibility and deductions against your pay slip. Federal medical uses the new-entrant frozen reference unless overridden; provincial and historical allowances/deductions remain provisional.',
      'Federal FY2026-27 ARA-2023/2024 default to the new-entrant minimum-pay reference (FD clarification 04-08-2026). Existing employees must enter their frozen amounts. DRA is opt-in and requires eligibility; enter the sanctioned total to include all continuing DRA components.',
      'Income tax annualises this month for 12 months without bonuses, tax credits or year-to-date adjustments. Enter only confirmed exempt allowances, or override with payroll withholding. Other payroll deductions can also be overridden.',
      `Official Source: ${dataset.notificationNumber} (${dataset.effectiveDate}).`,
      `Governed by ${dataset.governmentName} Budget (${dataset.year}).`,
      `GP Fund: Rs. ${gpFundDeduction.toLocaleString()}/month slab (${revisedFederalGpf ? 'Finance Division OM 13-08-2026' : 'historical/reference subscription; confirm the applicable provincial schedule'}).`,
      ...dataset.notes,
    ],
  };
}
