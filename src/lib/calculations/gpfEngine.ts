import { BudgetYear } from '../../types/government';
import { CalculatorOutput, BreakdownRow, ChartDataPoint } from '../../types/calculator';
import { getGpfConfig } from '../../data/allowances';
import { formatPKR, safeNumber } from '../utils/formatters';

export interface GpfEngineInputs {
  year?: BudgetYear;
  openingBalance?: number | string;
  monthlySubscription?: number | string;
  years?: number | string;
  interestRate?: number | string;
}

/**
 * Pure calculation engine for General Provident Fund (GP Fund) compound accumulation
 */
export function calculateGPF(inputs: GpfEngineInputs): CalculatorOutput {
  const budgetYear: BudgetYear = (inputs.year as BudgetYear) || '2026-27';
  const gpfConfig = getGpfConfig(budgetYear);
  const openingBalance = Math.max(safeNumber(inputs.openingBalance, 500000), 0);
  const monthlySubscription = Math.max(safeNumber(inputs.monthlySubscription, 8000), 100);
  const years = Math.min(Math.max(safeNumber(inputs.years, 5), 1), 35);
  const customRate = safeNumber(inputs.interestRate, -1);
  const rate = customRate > 0 ? customRate : gpfConfig.profitRate;

  let balance = openingBalance;
  let totalDeposited = openingBalance;
  let totalInterest = 0;

  const schedule: BreakdownRow[] = [];

  for (let y = 1; y <= years; y++) {
    const annualDeposit = monthlySubscription * 12;
    // Average balance earning interest: Opening + (AnnualDeposit / 2)
    const yearInterest = (balance + annualDeposit / 2) * (rate / 100);
    balance += annualDeposit + yearInterest;
    totalDeposited += annualDeposit;
    totalInterest += yearInterest;

    schedule.push({
      label: `Year ${y}`,
      amount: formatPKR(balance),
      detail: `Deposits: ${formatPKR(annualDeposit)} | Markup Added: ${formatPKR(yearInterest)}`,
    });
  }

  const breakdown: BreakdownRow[] = [
    { label: 'Initial Opening Balance', amount: formatPKR(openingBalance) },
    { label: `Monthly Subscription (${formatPKR(monthlySubscription)} × 12 × ${years} Years)`, amount: formatPKR(monthlySubscription * 12 * years) },
    { label: 'Total Principal Invested', amount: formatPKR(totalDeposited) },
    { label: `Total Govt Markup / Profit Earned (${rate.toFixed(2)}% per annum)`, amount: formatPKR(totalInterest), highlight: true } as any,
    { label: 'Final Maturity Balance on Retirement', amount: formatPKR(balance), isTotal: true },
  ];

  const chartData: ChartDataPoint[] = [
    { name: 'Principal Deposits', value: Math.round(totalDeposited), color: '#3b82f6' },
    { name: 'Compound Profit / Markup', value: Math.round(totalInterest), color: '#16a34a' },
  ];

  return {
    primaryResult: {
      id: 'gpfBalance',
      label: 'Projected GP Fund Maturity Balance',
      value: formatPKR(balance),
      type: 'currency',
      highlight: true,
      subtext: `Total Profit Earned: ${formatPKR(totalInterest)} at ${rate.toFixed(2)}% rate`,
      color: 'success',
    },
    secondaryResults: [
      { id: 'totalInterest', label: 'Total Government Profit', value: formatPKR(totalInterest), type: 'currency' },
      { id: 'totalDeposits', label: 'Total Employee Deposits', value: formatPKR(totalDeposited), type: 'currency' },
      { id: 'interestRate', label: 'Profit Markup Rate', value: `${rate.toFixed(2)}%`, type: 'percentage' },
    ],
    breakdown,
    chartType: 'pie',
    chartData,
    notes: [
      `Official Finance Division Notification rate: ${rate.toFixed(2)}% per annum.`,
      `Interest credited annually on monthly progressive progressive balance.`,
    ],
  };
}
