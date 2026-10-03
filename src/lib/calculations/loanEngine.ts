import { CalculatorOutput } from '../../types/calculator';
import { calculateLoanEmi } from '../calculators/loans';

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
 * Loan EMI & Bank Markup Amortization Engine for Pakistan.
 * Delegates to the canonical UI-wired implementation in src/lib/calculators/loans.ts
 * so EMI math exists in exactly one place.
 */
export function calculateLoan(inputs: LoanInputs): CalculatorOutput {
  let annualRate = inputs.interestRatePercent || 0;
  if (inputs.kiborRate !== undefined && inputs.bankSpread !== undefined) {
    annualRate = inputs.kiborRate + inputs.bankSpread;
  }
  annualRate = Math.max(0.1, annualRate);

  const tenureYears =
    inputs.tenureMonths && inputs.tenureMonths > 0
      ? inputs.tenureMonths / 12
      : inputs.tenureYears || 5;

  return calculateLoanEmi({
    loanAmount: inputs.loanAmount,
    annualInterestRate: annualRate,
    tenureYears,
  });
}
