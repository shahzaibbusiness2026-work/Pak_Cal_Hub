import { BPS_SCALES_2026, ADHOC_ALLOWANCES, GP_FUND_RATES } from '../data/bps-data';
import { formatPKR, formatPercent, safeNumber } from '../utils/formatters';
import { CalculatorOutput } from '../../types/calculator';

/**
 * Calculates BPS / Pakistan Government Salary with Allowances and Adhoc Reliefs under RBPS-2026
 * Effective 1 July 2026 (Finance Division OM No. F.1(2)IMP/2026)
 */
export function calculateBpsSalary(inputs: Record<string, any>): CalculatorOutput {
  const bps = safeNumber(inputs.bps, 17);
  const stage = safeNumber(inputs.stage, 0); // increment stage
  const cityType = inputs.cityType || 'big'; // 'big', 'other', 'none'
  const isBigCity = cityType === 'big';
  const isNoHra = cityType === 'none' || inputs.noHra === true;
  const qualificationPay = safeNumber(inputs.qualificationPay, 0);
  const specialAllowance = safeNumber(inputs.specialAllowance, 0);
  const includeAdhoc = inputs.includeAdhoc !== false;

  const scale = BPS_SCALES_2026[bps] || BPS_SCALES_2026[17];
  const effectiveStage = Math.min(stage, scale.stages);
  const basicPay = scale.minPay + effectiveStage * scale.increment;

  // House Rent Allowance (HRA) is FROZEN at 30-06-2026 admissibility levels as per Finance Division rules
  // If government accommodation is provided, HRA is 0
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

  // Conveyance Allowance — Flat rupee table (OM No. 3(1)R-5/2010-P-001, 21 July 2026)
  const conveyanceAllowance = scale.conveyanceAllowance;

  // Medical Allowance — Fixed monthly table (Rs 3,500 for BPS 1-15, Rs 4,000 for BPS 16-22)
  const medicalAllowance = scale.medicalAllowance;

  // Ad-hoc Relief Allowance 2026 (7% on new RBPS-2026 basic pay; ARA-2022 & ARA-2025 merged into basic)
  let adhoc2026 = 0;
  if (includeAdhoc) {
    adhoc2026 = basicPay * ADHOC_ALLOWANCES.adhoc2026;
  }

  const totalAllowances =
    houseRentAllowance +
    medicalAllowance +
    conveyanceAllowance +
    adhoc2026 +
    qualificationPay +
    specialAllowance;

  const grossSalary = basicPay + totalAllowances;

  // Standard Mandatory Deductions
  // GP Fund: BPS 1–15 → 5% of basic, BPS 16–22 → 8% of basic (Finance Division Rules, Schedule II)
  const gpFundPct = bps <= 15 ? 0.05 : 0.08;
  const gpFundDeduction = basicPay * gpFundPct;
  // Benevolent Fund: 2% of basic, capped at Rs. 2,500/month
  const benevolentFundDeduction = Math.min(basicPay * 0.02, 2500);
  // Group Insurance: BPS 1–15 → Rs. 350/mo, BPS 16–22 → Rs. 700/mo
  const groupInsurance = bps <= 15 ? 350 : 700;
  // 5% House Rent Deduction (HRD) if official accommodation is allotted
  const houseRentDeduction = isNoHra ? basicPay * 0.05 : 0;
  const totalDeductions = gpFundDeduction + benevolentFundDeduction + groupInsurance + houseRentDeduction;

  const netSalary = grossSalary - totalDeductions;

  const hralabel = isNoHra
    ? 'Official Govt Accommodation (0 HRA)'
    : isBigCity
    ? 'Big City HRA'
    : 'Non-Big City HRA';

  const breakdownRows: any[] = [
    { label: `Basic Pay (RBPS-2026 Grade ${bps} Stage ${effectiveStage})`, amount: formatPKR(basicPay), percentage: (basicPay / grossSalary) * 100 },
  ];

  if (isNoHra) {
    breakdownRows.push({ label: 'House Rent Allowance (Govt Accommodation Allotted)', amount: 'Rs. 0 (Not Admissible)' });
  } else {
    breakdownRows.push({
      label: `Frozen House Rent Allowance (${isBigCity ? 'Big City Schedule' : 'Other Station / Non-Big City'})`,
      amount: formatPKR(houseRentAllowance),
      percentage: (houseRentAllowance / grossSalary) * 100,
    });
  }

  breakdownRows.push(
    { label: 'Medical Allowance (Revised)', amount: formatPKR(medicalAllowance), percentage: (medicalAllowance / grossSalary) * 100 },
    { label: 'Conveyance Allowance (OM July 2026)', amount: formatPKR(conveyanceAllowance), percentage: (conveyanceAllowance / grossSalary) * 100 },
    { label: 'Ad-hoc Relief Allowance 2026 (7%)', amount: formatPKR(adhoc2026), percentage: (adhoc2026 / grossSalary) * 100 },
    { label: `GP Fund Deduction (${(gpFundPct * 100).toFixed(0)}% — ${bps <= 15 ? 'BPS 1–15' : 'BPS 16–22 Officer'})`, amount: formatPKR(gpFundDeduction), isDeduction: true },
    { label: 'Benevolent Fund (2%, Max Rs. 2,500)', amount: formatPKR(benevolentFundDeduction), isDeduction: true },
    { label: `Group Insurance (${bps <= 15 ? 'Rs. 350 — BPS 1–15' : 'Rs. 700 — BPS 16–22'})`, amount: formatPKR(groupInsurance), isDeduction: true }
  );

  if (houseRentDeduction > 0) {
    breakdownRows.push({
      label: 'Govt Accommodation 5% Maintenance Deduction (HRD)',
      amount: formatPKR(houseRentDeduction),
      isDeduction: true,
    });
  }

  breakdownRows.push({ label: 'Net Monthly Take-Home Pay', amount: formatPKR(netSalary), isTotal: true });

  const chartData: any[] = [
    { name: 'Basic Pay', value: Math.round(basicPay), color: '#16a34a' },
  ];
  if (houseRentAllowance > 0) {
    chartData.push({ name: 'House Rent (Frozen)', value: Math.round(houseRentAllowance), color: '#3b82f6' });
  }
  chartData.push(
    { name: 'ARA-2026 (7%)', value: Math.round(adhoc2026), color: '#eab308' },
    { name: 'Other Allowances', value: Math.round(medicalAllowance + conveyanceAllowance + qualificationPay + specialAllowance), color: '#8b5cf6' }
  );

  return {
    primaryResult: {
      id: 'netSalary',
      label: 'Monthly Net Take-Home Salary',
      value: formatPKR(netSalary),
      type: 'currency',
      highlight: true,
      subtext: `RBPS-2026 BPS-${bps} (Stage ${effectiveStage}) | ${hralabel}`,
      color: 'success',
    },
    secondaryResults: [
      { id: 'grossSalary', label: 'Gross Monthly Salary', value: formatPKR(grossSalary), type: 'currency' },
      { id: 'basicPay', label: 'Running Basic Pay (RBPS-2026)', value: formatPKR(basicPay), type: 'currency' },
      { id: 'totalAllowances', label: 'Total Allowances', value: formatPKR(totalAllowances), type: 'currency' },
      { id: 'totalDeductions', label: 'Monthly Deductions', value: formatPKR(totalDeductions), type: 'currency', color: 'warning' },
    ],
    breakdown: breakdownRows,
    chartType: 'pie',
    chartData,
    notes: [
      'Modeled strictly on Revised Basic Pay Scales 2026 (Finance Division OM No. F.1(2)IMP/2026, 21 July 2026).',
      'ARA-2022 (15%) and ARA-2025 (10%) are merged into basic pay. New 7% ARA-2026 applies on top of RBPS-2026 basic.',
      'GP Fund: BPS 1–15 deduct 5% of basic; BPS 16–22 Gazetted Officers deduct 8% of basic (Finance Division Schedule II).',
      isNoHra
        ? 'Government accommodation allotted: House Rent Allowance (HRA) is 0 and 5% House Rent Deduction (HRD) is deducted per Estate Office rules.'
        : isBigCity
        ? 'Big City HRA applied (Islamabad, Rawalpindi, Lahore, Karachi, Peshawar, Quetta, Faisalabad, Multan, Hyderabad).'
        : 'Non-Big City / Other Station HRA applied per frozen admissibility schedule.',
    ],
  };
}

/**
 * Civil Service Pension and Commutation Calculator
 * Handles Pre-July 2024 Defined Benefit Pension vs Post-July 2024 FGDC Defined Contribution Scheme
 */
export function calculatePension(inputs: Record<string, any>): CalculatorOutput {
  const hireScheme = inputs.hireScheme || 'pre-2024'; // 'pre-2024' or 'post-2024'
  const basicPay = safeNumber(inputs.lastBasicPay || inputs.basicPay, 95000);
  const serviceYears = Math.min(safeNumber(inputs.serviceYears, 30), 35);
  const ageAtRetirement = safeNumber(inputs.ageAtRetirement, 60);

  // 1. Post-July 2024 Hires: Federal Government Defined Contribution (FGDC) Pension Fund Scheme Rules 2024
  if (hireScheme === 'post-2024') {
    const employeeContribPct = 10; // 10% from employee salary
    const govtContribPct = 12;     // 12% from government
    const totalMonthlyContribPct = employeeContribPct + govtContribPct; // 22% total

    const monthlyEmployeeContrib = (basicPay * employeeContribPct) / 100;
    const monthlyGovtContrib = (basicPay * govtContribPct) / 100;
    const totalMonthlyInvestment = monthlyEmployeeContrib + monthlyGovtContrib;

    // Projected compound growth at nominal 12% annual return over serviceYears
    const annualReturnRate = 0.12;
    const monthlyRate = annualReturnRate / 12;
    const totalMonths = serviceYears * 12;

    const accumulatedCorpus = totalMonthlyInvestment > 0
      ? totalMonthlyInvestment * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate)
      : 0;

    // Estimated monthly annuity payout upon retirement (assuming ~8% safe withdrawal / annuity yield)
    const estimatedMonthlyAnnuity = (accumulatedCorpus * 0.08) / 12;

    return {
      primaryResult: {
        id: 'corpus',
        label: 'Projected Retirement Pension Corpus (FGDC)',
        value: formatPKR(accumulatedCorpus),
        type: 'currency',
        highlight: true,
        color: 'success',
        subtext: `Est. Monthly Annuity: ${formatPKR(estimatedMonthlyAnnuity)} / month`,
      },
      secondaryResults: [
        { id: 'monthlyContrib', label: 'Total Monthly Contribution (22%)', value: formatPKR(totalMonthlyInvestment), type: 'currency' },
        { id: 'govtShare', label: 'Government Share (12%)', value: formatPKR(monthlyGovtContrib), type: 'currency' },
        { id: 'employeeShare', label: 'Employee Share (10%)', value: formatPKR(monthlyEmployeeContrib), type: 'currency' },
        { id: 'scheme', label: 'Pension Regime', value: 'FGDC Defined Contribution (Post-2024)', type: 'badge' },
      ],
      breakdown: [
        { label: 'Pensionable Basic Pay', amount: formatPKR(basicPay) },
        { label: 'Employee Monthly Contribution (10%)', amount: formatPKR(monthlyEmployeeContrib) },
        { label: 'Federal Government Matching Contribution (12%)', amount: formatPKR(monthlyGovtContrib) },
        { label: 'Total Monthly Inflow into Pension Fund (22%)', amount: formatPKR(totalMonthlyInvestment) },
        { label: `Qualifying Service Duration (${serviceYears} Years)`, amount: `${serviceYears} Years (${totalMonths} Months)` },
        { label: `Estimated Accumulated Retirement Fund (@ 12% p.a.)`, amount: formatPKR(accumulatedCorpus), isTotal: true },
      ],
      notes: [
        'Under FGDC Pension Scheme Rules 2024, employees appointed on or after 1 July 2024 contribute 10% with a 12% government match into a licensed Pension Fund Manager (VPS model).',
        'Retirement payout is determined by accumulated fund value and market performance rather than the classic 70% formula.',
      ],
    };
  }

  // 2. Pre-July 2024 Hires: Classic Defined Benefit Pension Formula
  const totalServiceYears = Math.min(serviceYears, 30); // Max 30 years counted for classic 70% rate
  const commutationPercent = safeNumber(inputs.commutationPercent, 35); // Max 35% commuted

  // Gross Pension = (Average Emoluments × Service Years × 7) / 300 (max 70% of basic after 30 yrs)
  const grossPension = (basicPay * totalServiceYears * 7) / 300;

  // Commutation (Gratuity lump sum)
  const commutatedPart = (grossPension * commutationPercent) / 100;
  const netMonthlyPension = grossPension - commutatedPart;

  /**
   * Official Pakistan Government Commutation Table (Finance Division)
   * Source: Pension-cum-Gratuity Rules, Appendix I (Revised)
   * Factor = Number of years' purchase for a pension of Re. 1 per year
   * Age at retirement → purchase factor
   */
  const COMMUTATION_TABLE: Record<number, number> = {
    45: 14.31, 46: 14.00, 47: 13.68, 48: 13.36, 49: 13.05,
    50: 12.74, 51: 12.43, 52: 12.12, 53: 11.81, 54: 10.62,
    55: 10.00, 56: 9.67,  57: 9.33,  58: 9.00,  59: 8.74,
    60: 8.48,  61: 8.22,  62: 7.97,  63: 7.72,  64: 7.47,
    65: 7.22,
  };
  const clampedAge = Math.max(45, Math.min(65, Math.round(ageAtRetirement)));
  const commutationFactor = COMMUTATION_TABLE[clampedAge] ?? 8.48; // default 8.48 for age 60
  // Lump sum = commuted portion × 12 months × purchase factor
  const lumpSumCommutation = commutatedPart * 12 * commutationFactor;

  // Medical Allowance addition in pension (25% of gross pension, per Pension Rules)
  const pensionerMedical = grossPension * 0.25;
  // 7% Federal Pension Increase 2026-27 (Finance Division Pension Wing notification)
  const annualIncrease2026 = netMonthlyPension * 0.07;
  // Minimum pension floor: Rs. 25,000/month (Cabinet Committee decision, June 2026)
  const takeHomeMonthlyPension = Math.max(25000, netMonthlyPension + pensionerMedical + annualIncrease2026);

  return {
    primaryResult: {
      id: 'netMonthlyPension',
      label: 'Monthly Net Pension (Pre-2024 Scheme)',
      value: formatPKR(takeHomeMonthlyPension),
      type: 'currency',
      highlight: true,
      color: 'success',
      subtext: `Qualifying Service: ${totalServiceYears} Years | Age: ${ageAtRetirement}`,
    },
    secondaryResults: [
      { id: 'lumpSum', label: `Commutation Lump Sum (${commutationPercent}% × Factor ${commutationFactor})`, value: formatPKR(lumpSumCommutation), type: 'currency' },
      { id: 'grossPension', label: 'Gross Pension (Before Commutation)', value: formatPKR(grossPension), type: 'currency' },
      { id: 'medicalAllowance', label: 'Pensioner Medical Allowance (25%)', value: formatPKR(pensionerMedical), type: 'currency' },
      { id: 'minPension', label: 'Minimum Floor (2026)', value: 'Rs. 25,000/mo', type: 'badge' },
    ],
    breakdown: [
      { label: 'Last Drawn Basic Pay (or Average Emoluments)', amount: formatPKR(basicPay) },
      { label: `Qualifying Service (${totalServiceYears} Years, Max 30)`, amount: `${totalServiceYears} Years` },
      { label: 'Gross Calculated Pension (Max 70% at 30 Yrs)', amount: formatPKR(grossPension) },
      { label: `Commutation Deducted (${commutationPercent}% of Gross Pension)`, amount: formatPKR(commutatedPart), isDeduction: true },
      { label: `Commutation Lump Sum (Factor ${commutationFactor} for Age ${ageAtRetirement})`, amount: formatPKR(lumpSumCommutation) },
      { label: 'Pensioner Medical Allowance (25% of Gross)', amount: formatPKR(pensionerMedical) },
      { label: '2026-27 Federal Pension Increase (7%)', amount: formatPKR(annualIncrease2026) },
      { label: 'Net Monthly Take-Home Pension (Min Rs. 25,000)', amount: formatPKR(takeHomeMonthlyPension), isTotal: true },
    ],
    notes: [
      'Applicable to civil employees appointed before 1 July 2024 under classic Defined Benefit Pension rules.',
      'Commutation factor from official Finance Division Pakistan Pension-cum-Gratuity Rules, Appendix I (Revised).',
      'Includes 7% federal pension increase for 2026-27 and statutory minimum pension floor of Rs. 25,000/month (Cabinet Committee, June 2026).',
    ],
  };
}

/**
 * Annual Increment & Arrears Calculator
 */
export function calculateIncrementArrears(inputs: Record<string, any>): CalculatorOutput {
  const currentBasic = safeNumber(inputs.currentBasic, 54140);
  const annualIncrement = safeNumber(inputs.annualIncrement, 4100);
  const arrearsMonths = safeNumber(inputs.arrearsMonths, 6);

  const newBasicPay = currentBasic + annualIncrement;
  const monthlyDifference = annualIncrement;
  const totalArrears = monthlyDifference * arrearsMonths;

  return {
    primaryResult: {
      id: 'totalArrears',
      label: 'Total Arrears Payable',
      value: formatPKR(totalArrears),
      type: 'currency',
      highlight: true,
      color: 'success',
    },
    secondaryResults: [
      { id: 'newBasic', label: 'New Basic Pay (After Increment)', value: formatPKR(newBasicPay), type: 'currency' },
      { id: 'monthlyDiff', label: 'Monthly Difference', value: formatPKR(monthlyDifference), type: 'currency' },
    ],
    breakdown: [
      { label: 'Previous Basic Pay', amount: formatPKR(currentBasic) },
      { label: 'Annual Increment Amount (1st December)', amount: formatPKR(annualIncrement) },
      { label: 'Updated Basic Pay', amount: formatPKR(newBasicPay) },
      { label: `Arrears Period (${arrearsMonths} Months)`, amount: formatPKR(totalArrears), isTotal: true },
    ],
  };
}

/**
 * GP Fund (General Provident Fund) Interest Calculator
 */
export function calculateGpFund(inputs: Record<string, any>): CalculatorOutput {
  const openingBalance = safeNumber(inputs.openingBalance, 600000);
  const monthlySubscription = safeNumber(inputs.monthlySubscription, 9000);
  const interestRate = safeNumber(inputs.interestRate, GP_FUND_RATES.fy2025_26); // Default 12.05% benchmark
  const years = safeNumber(inputs.years, 5);

  let currentBalance = openingBalance;
  let totalDeposited = openingBalance;

  for (let y = 1; y <= years; y++) {
    const annualDeposit = monthlySubscription * 12;
    totalDeposited += annualDeposit;
    // Interest calculated on opening balance + average monthly balance
    const interest = (currentBalance + annualDeposit / 2) * (interestRate / 100);
    currentBalance += annualDeposit + interest;
  }

  const totalProfit = currentBalance - totalDeposited;

  return {
    primaryResult: {
      id: 'finalBalance',
      label: 'Estimated GP Fund Balance',
      value: formatPKR(currentBalance),
      type: 'currency',
      highlight: true,
      color: 'success',
    },
    secondaryResults: [
      { id: 'totalDeposits', label: 'Total Subscriptions Deposited', value: formatPKR(totalDeposited), type: 'currency' },
      { id: 'totalProfit', label: 'Total Accumulated Profit / Mark-up', value: formatPKR(totalProfit), type: 'currency' },
    ],
    chartType: 'pie',
    chartData: [
      { name: 'Your Contributions', value: Math.round(totalDeposited), color: '#3b82f6' },
      { name: 'Accumulated Profit', value: Math.round(totalProfit), color: '#10b981' },
    ],
    notes: [
      `Calculated using latest official GP Fund mark-up benchmark rate of ${interestRate}%.`,
      'Employees can also opt for Non-Interest (mark-up free) GP Fund account as per service rules.',
    ],
  };
}
