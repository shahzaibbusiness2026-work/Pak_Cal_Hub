import { CalculatorOutput, BreakdownRow } from '../../types/calculator';
import { formatPKR } from '../utils/formatters';

export interface LoanInputs {
  loanAmount: number;
  interestRatePercent: number; // Annual markup rate %
  tenureYears?: number;
  tenureMonths?: number;
  kiborRate?: number; // Optional Base KIBOR
  bankSpread?: number; // Optional Bank Spread
  loanType?: 'personal' | 'home' | 'car' | 'business';
}

/**
 * Pure Loan EMI & Bank Markup Amortization Engine for Pakistan
 */
export function calculateLoan(inputs: LoanInputs): CalculatorOutput {
  const principal = Math.max(0, inputs.loanAmount || 0);
  
  let annualRate = inputs.interestRatePercent || 0;
  if (inputs.kiborRate !== undefined && inputs.bankSpread !== undefined) {
    annualRate = inputs.kiborRate + inputs.bankSpread;
  }
  annualRate = Math.max(0.1, annualRate);

  const totalMonths = inputs.tenureMonths && inputs.tenureMonths > 0
    ? inputs.tenureMonths
    : Math.max(1, (inputs.tenureYears || 5) * 12);

  // Standard Monthly EMI formula: [P * r * (1 + r)^n] / [(1 + r)^n - 1]
  const monthlyRate = annualRate / 12 / 100;
  const factor = Math.pow(1 + monthlyRate, totalMonths);
  const monthlyEmi = (principal * monthlyRate * factor) / (factor - 1);

  const totalPayment = monthlyEmi * totalMonths;
  const totalInterest = totalPayment - principal;

  // First month breakdown
  const firstMonthInterest = principal * monthlyRate;
  const firstMonthPrincipal = monthlyEmi - firstMonthInterest;

  const breakdown: BreakdownRow[] = [
    { label: 'Borrowed Loan Amount (Principal)', amount: formatPKR(principal), type: 'earning' },
    { label: `Annual Markup Rate`, amount: `${annualRate.toFixed(2)}% per annum`, type: 'earning' },
    { label: `Loan Repayment Tenure`, amount: `${(totalMonths / 12).toFixed(1)} Years (${totalMonths} Months)`, type: 'earning' },
    { label: `Monthly Equated Installment (EMI)`, amount: formatPKR(monthlyEmi), type: 'total' },
    { label: `Total Bank Markup / Interest Payable`, amount: formatPKR(totalInterest), type: 'deduction' },
    { label: `Total Cumulative Repayment`, amount: formatPKR(totalPayment), type: 'total' },
  ];

  return {
    primaryResult: {
      id: 'monthlyEmi',
      label: 'Monthly Loan Installment (EMI)',
      value: formatPKR(monthlyEmi),
      subtext: `${totalMonths} Months Tenure @ ${annualRate.toFixed(2)}% Markup`,
    },
    secondaryResults: [
      { id: 'principal', label: 'Principal Amount', value: formatPKR(principal) },
      { id: 'totalInterest', label: 'Total Bank Markup', value: formatPKR(totalInterest) },
      { id: 'totalPayment', label: 'Total Repayment Amount', value: formatPKR(totalPayment) },
      { id: 'interestRatio', label: 'Interest to Principal Ratio', value: `${((totalInterest / principal) * 100).toFixed(1)}%` },
    ],
    breakdown,
  };
}
