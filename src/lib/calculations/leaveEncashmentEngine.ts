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
    { label: 'Entered Approved Monthly Pay Basis', amount: formatPKR(basicPay) },
    { label: 'Daily Rate (Entered Monthly Pay ÷ 30)', amount: formatPKR(dailyWage) },
    { label: 'Entered Approved Encashable Days', amount: `${leaveDays} Days` },
    { label: 'Equivalent Leave Duration in Months', amount: `${(leaveDays / 30).toFixed(1)} Months` },
    { label: 'Total Gross Leave Encashment Lump Sum', amount: formatPKR(totalEncashment), isTotal: true },
  ];

  const chartData: ChartDataPoint[] = [
    { name: 'Leave Encashment Lump Sum', value: totalEncashment, color: '#16a34a' },
  ];

  return {
    primaryResult: {
      id: 'leaveEncashment',
      label: 'Estimated Leave Encashment',
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
      'This arithmetic estimate uses entered monthly pay divided by 30 and up to 365 entered days. Eligibility, encashable days and the admissible pay basis differ by jurisdiction and retirement date.',
      'The government selector does not apply a verified provincial pay-basis rule. Confirm the admissible monthly pay and approved days with your accounts office before relying on this amount.',
    ],
  };
}
