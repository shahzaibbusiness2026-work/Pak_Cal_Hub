import { formatPKR, formatPercent, safeNumber, formatNumber } from '../utils/formatters';
import { CalculatorOutput, BreakdownRow, ChartDataPoint } from '../../types/calculator';

/**
 * Calculates Loan Monthly Installment (EMI), Total Markup & Amortization Schedule
 */
export function calculateLoanEmi(inputs: Record<string, any>): CalculatorOutput {
  const loanAmount = safeNumber(inputs.loanAmount, 3000000); // 30 Lakh
  const annualInterestRate = safeNumber(inputs.annualInterestRate, 13.5); // KIBOR + spread (SBP Policy rate 11.5% as of Aug 2026)
  const tenureYears = safeNumber(inputs.tenureYears, 5); // 5 years
  const isIslamic = inputs.loanType === 'islamic'; // Diminishing Musharakah vs Conventional

  const totalMonths = tenureYears * 12;
  const monthlyRate = annualInterestRate / (12 * 100);

  // EMI formula: [P * r * (1 + r)^n] / [(1 + r)^n - 1]
  let monthlyEmi = 0;
  if (monthlyRate === 0) {
    monthlyEmi = loanAmount / totalMonths;
  } else {
    monthlyEmi =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
  }

  const totalPayment = monthlyEmi * totalMonths;
  const totalInterest = totalPayment - loanAmount;

  // Generate Year-by-Year Schedule
  let balance = loanAmount;
  const schedule: Array<{ period: number; payment: number; principal: number; interest: number; balance: number }> = [];

  for (let year = 1; year <= tenureYears; year++) {
    let yearPrincipal = 0;
    let yearInterest = 0;
    for (let m = 1; m <= 12; m++) {
      const interestForMonth = balance * monthlyRate;
      const principalForMonth = monthlyEmi - interestForMonth;
      yearPrincipal += principalForMonth;
      yearInterest += interestForMonth;
      balance = Math.max(0, balance - principalForMonth);
    }
    schedule.push({
      period: year,
      payment: Math.round(monthlyEmi * 12),
      principal: Math.round(yearPrincipal),
      interest: Math.round(yearInterest),
      balance: Math.round(balance),
    });
  }

  const chartData: ChartDataPoint[] = [
    { name: 'Principal Financed', value: Math.round(loanAmount), color: '#3b82f6' },
    { name: isIslamic ? 'Total Profit / Rent' : 'Total Bank Mark-up / Interest', value: Math.round(totalInterest), color: '#ef4444' },
  ];

  return {
    primaryResult: {
      id: 'monthlyEmi',
      label: isIslamic ? 'Monthly Rental & Unit Purchase' : 'Monthly Loan Installment (EMI)',
      value: formatPKR(monthlyEmi),
      type: 'currency',
      highlight: true,
      color: 'success',
      subtext: `${totalMonths} Monthly Installments`,
    },
    secondaryResults: [
      { id: 'totalInterest', label: isIslamic ? 'Total Profit Paid' : 'Total Mark-up Paid', value: formatPKR(totalInterest), type: 'currency', color: 'warning' },
      { id: 'totalPayment', label: 'Total Repayable Amount', value: formatPKR(totalPayment), type: 'currency' },
      { id: 'rate', label: isIslamic ? 'Profit Rate (KIBOR Spread)' : 'Annual Interest Rate', value: formatPercent(annualInterestRate), type: 'percentage' },
    ],
    breakdown: [
      { label: 'Financed Amount (Principal)', amount: formatPKR(loanAmount) },
      { label: isIslamic ? 'Agreed Profit / Mark-up Rate' : 'Annual Interest Rate', amount: `${annualInterestRate}% p.a.` },
      { label: 'Loan Tenure / Duration', amount: `${tenureYears} Years (${totalMonths} Months)` },
      { label: isIslamic ? 'Total Profit Margin' : 'Total Interest Charged', amount: formatPKR(totalInterest) },
      { label: 'Total Payable to Bank', amount: formatPKR(totalPayment), isTotal: true },
    ],
    chartType: 'pie',
    chartData,
    amortizationSchedule: schedule,
    notes: [
      isIslamic
        ? 'Islamic Diminishing Musharakah financing involves gradual unit purchasing and rent payments.'
        : 'Based on reducing balance standard banking amortization schedules.',
    ],
  };
}

/**
 * Debt-To-Income (DTI) and Loan Affordability Calculator
 * Compliant with SBP Prudential Regulations (40% for General Consumer Loans, 65% for Housing Finance)
 */
export function calculateLoanAffordability(inputs: Record<string, any>): CalculatorOutput {
  const monthlyIncome = safeNumber(inputs.monthlyIncome, 220000); // Rs. 2.2 Lakh
  const existingEmis = safeNumber(inputs.existingEmis, 35000);
  const loanCategory = inputs.loanCategory || 'general'; // 'general' (Personal/Auto) or 'housing' (Home Loan)
  
  // SBP Prudential Regulations: 40% DBR for Consumer/Auto, 65% for Housing Finance (Aug 2026 SBP Circular)
  const defaultDbr = loanCategory === 'housing' ? 65 : 40;
  const maxDtiLimit = safeNumber(inputs.maxDtiLimit, defaultDbr);

  const maxAllowedMonthlyEmi = (monthlyIncome * maxDtiLimit) / 100;
  const availableEmiCapacity = Math.max(0, maxAllowedMonthlyEmi - existingEmis);
  const currentDti = monthlyIncome > 0 ? (existingEmis / monthlyIncome) * 100 : 0;

  // Rate & Tenor parameters
  const annualRate = loanCategory === 'housing' ? 0.14 : 0.165; // ~14% home loan vs ~16.5% auto/personal
  const tenureYears = loanCategory === 'housing' ? 20 : 5; // Up to 30 yrs for housing, 5 yrs for general
  const months = tenureYears * 12;
  const monthlyRate = annualRate / 12;

  const maxEligibleLoan = availableEmiCapacity > 0
    ? (availableEmiCapacity * (Math.pow(1 + monthlyRate, months) - 1)) / (monthlyRate * Math.pow(1 + monthlyRate, months))
    : 0;

  return {
    primaryResult: {
      id: 'eligibleLoan',
      label: `Max ${loanCategory === 'housing' ? 'Housing Loan' : 'Consumer Loan'} Eligibility`,
      value: formatPKR(maxEligibleLoan),
      type: 'currency',
      highlight: true,
      color: availableEmiCapacity > 0 ? 'success' : 'error',
      subtext: `Capacity: ${formatPKR(availableEmiCapacity)}/mo (${tenureYears} yrs @ ${(annualRate * 100).toFixed(1)}%)`,
    },
    secondaryResults: [
      { id: 'dti', label: 'Current Debt Burden (DTI)', value: formatPercent(currentDti), type: 'percentage' },
      { id: 'maxCapacity', label: `Max SBP Capacity (${maxDtiLimit}%)`, value: formatPKR(maxAllowedMonthlyEmi), type: 'currency' },
      { id: 'status', label: 'SBP Compliance', value: currentDti <= maxDtiLimit ? 'Eligible' : `Exceeds ${maxDtiLimit}% Ceiling`, type: 'badge' },
    ],
    breakdown: [
      { label: 'Verified Monthly Take-Home Income', amount: formatPKR(monthlyIncome) },
      { label: 'Existing Monthly Debt Obligations', amount: formatPKR(existingEmis) },
      { label: `SBP Maximum Allowed Debt Burden (${maxDtiLimit}% for ${loanCategory === 'housing' ? 'Housing' : 'Consumer/Auto'})`, amount: formatPKR(maxAllowedMonthlyEmi) },
      { label: 'Available EMI Capacity for New Loan', amount: formatPKR(availableEmiCapacity), isTotal: true },
    ],
    notes: [
      loanCategory === 'housing'
        ? 'Under SBP Housing Finance Circular (August 2026), the Debt Burden Ratio (DBR) ceiling is set to 65% with tenors up to 30 years.'
        : 'Under SBP Consumer Financing Regulations (BPRD Circular 29), total Debt Burden Ratio (DBR) for personal, auto, and credit card loans is capped at 40%.',
    ],
  };
}
