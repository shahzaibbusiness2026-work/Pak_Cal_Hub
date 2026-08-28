import { GovernmentType, BudgetYear } from '../../types/government';
import { CalculatorOutput, BreakdownRow, ChartDataPoint } from '../../types/calculator';
import { formatPKR, safeNumber } from '../utils/formatters';

export interface LeaveEncashmentInputs {
  government?: GovernmentType;
  year?: BudgetYear;
  basicPay?: number | string;
  leaveDays?: number | string;
}

/**
 * Pure calculation engine for Leave Encashment in Lieu of LPR
 */
export function calculateLeaveEncashment(inputs: LeaveEncashmentInputs): CalculatorOutput {
  const basicPay = Math.max(safeNumber(inputs.basicPay, 95000), 0);
  const leaveDays = Math.min(Math.max(safeNumber(inputs.leaveDays, 365), 0), 365);

  const dailyWage = basicPay / 30;
  const totalEncashment = Math.round(dailyWage * leaveDays);
  const monthlyEquivalent = totalEncashment / (leaveDays / 30 || 1);

  const breakdown: BreakdownRow[] = [
    { label: 'Last Drawn Running Basic Pay', amount: formatPKR(basicPay) },
    { label: 'Computed Daily Basic Wage Rate (Basic Pay ÷ 30)', amount: formatPKR(dailyWage) },
    { label: `Accumulated Privilege Leave Days Surrendered (Max 365 Days)`, amount: `${leaveDays} Days` },
    { label: 'Equivalent Leave Duration in Months', amount: `${(leaveDays / 30).toFixed(1)} Months` },
    { label: 'Total Gross Leave Encashment Lump Sum', amount: formatPKR(totalEncashment), isTotal: true },
  ];

  const chartData: ChartDataPoint[] = [
    { name: 'Leave Encashment Lump Sum', value: totalEncashment, color: '#16a34a' },
  ];

  return {
    primaryResult: {
      id: 'leaveEncashment',
      label: 'LPR Leave Encashment Lump Sum',
      value: formatPKR(totalEncashment),
      type: 'currency',
      highlight: true,
      subtext: `${leaveDays} Days Surrendered | Daily Rate: ${formatPKR(dailyWage)}`,
      color: 'success',
    },
    secondaryResults: [
      { id: 'leaveDays', label: 'Encashable Days', value: `${leaveDays} Days`, type: 'number' },
      { id: 'monthlyRate', label: 'Monthly Equivalent', value: formatPKR(monthlyEquivalent), type: 'currency' },
      { id: 'dailyRate', label: 'Daily Pay Rate', value: formatPKR(dailyWage), type: 'currency' },
    ],
    breakdown,
    chartType: 'pie',
    chartData,
    notes: [
      `Official Rule: Revised Leave Rules 1980 / Provincial Leave Rules.`,
      `Maximum allowable encashment is strictly capped at 365 days (12 calendar months).`,
      `Encashment is calculated purely on Basic Pay without allowances.`,
    ],
  };
}
