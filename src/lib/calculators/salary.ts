import { calculateSalary, calculatePension as calcPensionEngine, calculateGPF } from '../calculations';
import { formatPKR, safeNumber } from '../utils/formatters';
import { CalculatorOutput } from '../../types/calculator';

/**
 * Calculates BPS / Pakistan Government Salary with Allowances and Adhoc Reliefs
 * Delegates to the pure multi-government, multi-year salaryEngine
 */
export function calculateBpsSalary(inputs: Record<string, any>): CalculatorOutput {
  return calculateSalary(inputs);
}

/**
 * Civil Service Pension and Commutation Calculator
 * Delegates to pure multi-government pensionEngine
 */
export function calculatePension(inputs: Record<string, any>): CalculatorOutput {
  return calcPensionEngine({
    government: inputs.government,
    year: inputs.year,
    schemeType: inputs.hireScheme || inputs.schemeType,
    basicPay: inputs.lastBasicPay || inputs.basicPay,
    serviceYears: inputs.serviceYears,
    age: inputs.ageAtRetirement || inputs.age,
    commutationPercent: inputs.commutationPercent,
    bps: inputs.bps,
  });
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
 * Delegates to pure gpfEngine
 */
export function calculateGpFund(inputs: Record<string, any>): CalculatorOutput {
  return calculateGPF({
    year: inputs.year,
    openingBalance: inputs.openingBalance,
    monthlySubscription: inputs.monthlySubscription,
    years: inputs.years,
    interestRate: inputs.interestRate,
  });
}
